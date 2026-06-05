import { strFromU8, strToU8, unzip, zipSync } from 'fflate';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

import { isWrAuthStorageRef, parseWrAuthStorageRef } from '@/constants/wrauth-storage';
import { authSessionService } from '@/services/auth-session.service';
import { photoVaultService } from '@/services/photo-vault.service';
import { executeWithAccessTokenRetry } from '@/services/wrauth-session-refresh.service';
import { WrAuthRequestError, wrAuthClient } from '@/services/wrauth.client';
import type { WrAuthCategoryRow, WrAuthPhotoMetadataRow } from '@/types/wrauth-data.types';
import type { WrAuthProfile } from '@/types/wrauth.types';
import { parseCategoryIds } from '@/utils/parse-category-ids';
import { decryptPhotoBytes } from '@/utils/photo-crypto';

const UNSORTED_FOLDER = '_Unsorted';
const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04] as const;

type PortableManifest = {
  format: string;
  exported_at: string;
  user: { id: string; email: string };
};

type ExportError = {
  photo_id: string;
  reason: string;
};

type PortableEntries = Record<string, Uint8Array>;

const sanitizeFolderName = (name: string): string => {
  const trimmed = name.trim();
  return (trimmed || 'FitTrack Export').replace(/[^a-zA-Z0-9 _-]/g, '_');
};

const isZipArchive = (bytes: Uint8Array): boolean =>
  bytes.length >= 4 &&
  bytes[0] === ZIP_MAGIC[0] &&
  bytes[1] === ZIP_MAGIC[1] &&
  bytes[2] === ZIP_MAGIC[2] &&
  bytes[3] === ZIP_MAGIC[3];

const unzipPortable = (bytes: Uint8Array): Promise<PortableEntries> =>
  new Promise((resolve, reject) => {
    unzip(bytes, (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data);
    });
  });

const readTableRows = <T>(entries: PortableEntries, tableKey: string): T[] => {
  const bytes = entries[`tables/${tableKey}.json`];
  if (!bytes) {
    return [];
  }
  const parsed = JSON.parse(strFromU8(bytes)) as unknown;
  if (Array.isArray(parsed)) {
    return parsed as T[];
  }
  if (
    parsed &&
    typeof parsed === 'object' &&
    Array.isArray((parsed as { rows?: T[] }).rows)
  ) {
    return (parsed as { rows: T[] }).rows;
  }
  return [];
};

const isMissingStoragePlaceholder = (path: string): boolean => path.endsWith('.missing.json');

const findStorageBlob = (
  entries: PortableEntries,
  objectId: string,
  purpose: string
): Uint8Array | null => {
  const prefix = `storage/${purpose}/`;
  const direct = entries[`${prefix}${objectId}.bin`] ?? entries[`${prefix}${objectId}.jpg`];
  if (direct) {
    return direct;
  }
  for (const [path, bytes] of Object.entries(entries)) {
    if (isMissingStoragePlaceholder(path)) {
      continue;
    }
    if (path.startsWith(prefix) && path.includes(objectId)) {
      return bytes;
    }
  }
  return null;
};

const findVaultKeyBytes = (entries: PortableEntries): Uint8Array | null => {
  for (const [path, bytes] of Object.entries(entries)) {
    if (path.startsWith('storage/photo_vault_key/') && bytes.length === 32) {
      return bytes;
    }
  }
  return null;
};

const resolveVaultKey = async (entries: PortableEntries): Promise<Uint8Array | null> => {
  const fromExport = findVaultKeyBytes(entries);
  if (fromExport) {
    return fromExport;
  }
  try {
    const sessionKey = await photoVaultService.getOrCreateKey();
    return sessionKey.length === 32 ? sessionKey : null;
  } catch {
    return null;
  }
};

const formatPhotoFilename = (capturedAt: string, photoId: string): string => {
  const date = new Date(capturedAt);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const idPart = photoId.replace(/-/g, '').slice(0, 8);
  return `${yyyy}-${mm}-${dd}_${hh}${min}${ss}_${idPart}.jpg`;
};

const resolveDisplayName = (
  profile: WrAuthProfile | undefined,
  sessionDisplayName: string | undefined,
  email: string
): string => {
  const fromProfile = profile?.display_name?.trim();
  if (fromProfile) {
    return fromProfile;
  }
  if (sessionDisplayName?.trim()) {
    return sessionDisplayName.trim();
  }
  const localPart = email.split('@')[0]?.trim();
  return localPart || 'FitTrack Export';
};

const buildHumanZip = async (
  portableEntries: PortableEntries,
  sessionDisplayName: string | undefined,
  sessionEmail: string
): Promise<Uint8Array> => {
  const manifestBytes = portableEntries['manifest.json'];
  const manifest = manifestBytes
    ? (JSON.parse(strFromU8(manifestBytes)) as PortableManifest)
    : null;

  const profiles = readTableRows<WrAuthProfile>(portableEntries, 'profiles');
  const categories = readTableRows<WrAuthCategoryRow>(portableEntries, 'categories');
  const photos = readTableRows<WrAuthPhotoMetadataRow>(portableEntries, 'photo_metadata');

  const vaultKey = await resolveVaultKey(portableEntries);
  if (!vaultKey && photos.some(photo => isWrAuthStorageRef(photo.local_id))) {
    throw new Error(
      'Could not decrypt photos. Sign in on your primary device and try again, or contact support.'
    );
  }

  const email = manifest?.user.email ?? sessionEmail;
  const displayName = resolveDisplayName(profiles[0], sessionDisplayName, email);
  const rootFolder = `${sanitizeFolderName(displayName)}/`;

  const categoryNameById = new Map<string, string>();
  for (const category of categories) {
    categoryNameById.set(category.id, sanitizeFolderName(category.name));
  }

  const humanEntries: Record<string, Uint8Array> = {};
  const errors: ExportError[] = [];
  let exportedPhotoCount = 0;

  humanEntries[`${rootFolder}profile.json`] = strToU8(JSON.stringify(profiles[0] ?? {}, null, 2));

  const avatarBlob = Object.entries(portableEntries).find(([path]) =>
    path.startsWith('storage/avatar/')
  );
  if (avatarBlob) {
    humanEntries[`${rootFolder}avatar.jpg`] = avatarBlob[1];
  }

  // Multi-category photos: Option A — include a copy in each category folder.
  for (const photo of photos) {
    if (!isWrAuthStorageRef(photo.local_id)) {
      errors.push({ photo_id: photo.id, reason: 'Photo is not stored in cloud storage.' });
      continue;
    }

    const objectId = parseWrAuthStorageRef(photo.local_id);
    const ciphertext = findStorageBlob(portableEntries, objectId, 'progress_photo');
    if (!ciphertext) {
      errors.push({ photo_id: photo.id, reason: 'Encrypted photo blob missing from export.' });
      continue;
    }

    if (!vaultKey) {
      errors.push({ photo_id: photo.id, reason: 'Vault key missing from export.' });
      continue;
    }

    let decrypted: Uint8Array;
    try {
      decrypted = await decryptPhotoBytes(ciphertext, vaultKey);
    } catch {
      errors.push({ photo_id: photo.id, reason: 'Decryption failed.' });
      continue;
    }

    const filename = formatPhotoFilename(photo.captured_at, photo.id);
    const categoryIds = parseCategoryIds(photo.categories);
    const folderNames = categoryIds
      .map(id => categoryNameById.get(id))
      .filter((name): name is string => Boolean(name));

    const targets = folderNames.length > 0 ? folderNames : [UNSORTED_FOLDER];
    for (const folderName of targets) {
      humanEntries[`${rootFolder}${folderName}/${filename}`] = decrypted;
    }
    exportedPhotoCount += 1;
  }

  for (const category of categories) {
    const folderName = sanitizeFolderName(category.name);
    const hasPhoto = Object.keys(humanEntries).some(path =>
      path.startsWith(`${rootFolder}${folderName}/`) && !path.endsWith('.gitkeep')
    );
    if (!hasPhoto) {
      humanEntries[`${rootFolder}${folderName}/.gitkeep`] = strToU8('\n');
    }
  }

  if (errors.length > 0) {
    humanEntries[`${rootFolder}errors.json`] = strToU8(JSON.stringify(errors, null, 2));
  }

  humanEntries[`${rootFolder}manifest.json`] = strToU8(
    JSON.stringify(
      {
        format: 'fittrack_human_export_v1',
        exported_at: new Date().toISOString(),
        display_name: displayName,
        multi_category_policy: 'copy_to_each_folder',
        photo_count: exportedPhotoCount,
        skipped_photos: errors.length,
        source_format: manifest?.format ?? 'unknown',
      },
      null,
      2
    )
  );

  return zipSync(humanEntries, { level: 6 });
};

const writeExportZip = (fileName: string, zipBytes: Uint8Array): void => {
  const exportFile = new File(Paths.cache, fileName);
  if (exportFile.exists) {
    exportFile.delete();
  }
  exportFile.create({ overwrite: true });
  exportFile.write(zipBytes);
  if (!exportFile.exists) {
    throw new Error('Could not write export file to device cache.');
  }
};

export const dataExportService = {
  async exportUserDataZip(): Promise<void> {
    const session = await authSessionService.getSession();
    if (!session?.access_token) {
      throw new Error('Sign in to export your data.');
    }

    let portableBuffer: ArrayBuffer;
    try {
      portableBuffer = await executeWithAccessTokenRetry(accessToken =>
        wrAuthClient.downloadDataExport(accessToken)
      );
    } catch (error) {
      if (error instanceof WrAuthRequestError) {
        const hint =
          error.code === 'INTERNAL_SERVER_ERROR'
            ? ' Restart wrAuth after updating to the latest export fix, then try again.'
            : '';
        throw new Error(`${error.message}${hint}`);
      }
      const detail = error instanceof Error ? error.message : 'Download failed';
      throw new Error(`Could not download your data from wrAuth (${detail}).`);
    }

    const portableBytes = new Uint8Array(portableBuffer);
    if (!isZipArchive(portableBytes)) {
      throw new Error(
        'Server returned an invalid export file. Update wrAuth and try again.'
      );
    }

    let portableEntries: PortableEntries;
    try {
      portableEntries = await unzipPortable(portableBytes);
    } catch {
      throw new Error(
        'Could not read the export archive. The download may be incomplete — try again.'
      );
    }

    const humanZip = await buildHumanZip(
      portableEntries,
      session.display_name,
      session.user.email
    );

    const safeLabel = sanitizeFolderName(
      session.display_name?.trim() || session.user.email.split('@')[0] || 'fittrack'
    );
    const fileName = `${safeLabel}-fittrack-export-${Date.now()}.zip`;
    writeExportZip(fileName, humanZip);

    const exportFile = new File(Paths.cache, fileName);
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error('Sharing is not available on this device.');
    }

    try {
      await Sharing.shareAsync(exportFile.uri, {
        mimeType: 'application/zip',
        dialogTitle: 'Export FitTrack data',
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Share failed';
      throw new Error(`Export was created but could not be shared (${detail}).`);
    }
  },
};
