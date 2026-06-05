import { isWrAuthStorageRef } from '@/constants/wrauth-storage';
import { dataMigrationService } from '@/services/data-migration.service';
import { photoSessionCache } from '@/services/photo-session-cache.service';
import { photoVaultService } from '@/services/photo-vault.service';
import { wrAuthDataService } from '@/services/wrauth-data.service';
import { wrAuthStorageService } from '@/services/wrauth-storage.service';
import { ProgressImage } from '@/types/photo.types';
import { bytesToBase64, base64ToBytes } from '@/utils/bytes-base64';
import { parseCategoryIds, serializeCategoryIds } from '@/utils/parse-category-ids';
import { compressImageForStorage } from '@/utils/compress-image';
import { parseTimestampMs } from '@/utils/parse-timestamp';
import { decryptPhotoBytes, encryptPhotoBytes } from '@/utils/photo-crypto';
import { File, readAsStringAsync } from 'expo-file-system';

interface PhotoRow {
  id: string;
  local_id: string;
  width: number;
  height: number;
  captured_at: string;
  categories: unknown;
}

const JPEG_DATA_URI_PREFIX = 'data:image/jpeg;base64,';

const toDataUri = (jpegBytes: Uint8Array): string => `${JPEG_DATA_URI_PREFIX}${bytesToBase64(jpegBytes)}`;

const mapPhoto = (row: PhotoRow, uriOverride?: string): ProgressImage => ({
  id: String(row.id),
  uri: uriOverride ?? row.local_id,
  width: row.width ?? 0,
  height: row.height ?? 0,
  timestamp: parseTimestampMs(row.captured_at),
  categories: parseCategoryIds(row.categories),
});

const ensureSynced = async () => {
  await dataMigrationService.migrateLocalDataToWrAuthIfNeeded();
};

const readUriBytes = async (uri: string) => {
  if (uri.startsWith('file://')) {
    return await new File(uri).bytes();
  }
  const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
  return base64ToBytes(base64);
};

const isCloudPhotoRef = (localId: string): boolean =>
  isWrAuthStorageRef(localId) ||
  localId.startsWith('http://') ||
  localId.startsWith('https://');

const resolveDisplayUri = async (row: PhotoRow): Promise<string | null> => {
  const cached = photoSessionCache.get(row.id);
  if (cached) {
    return cached;
  }

  if (row.local_id.startsWith('http://') || row.local_id.startsWith('https://')) {
    return row.local_id;
  }

  if (!isWrAuthStorageRef(row.local_id)) {
    return null;
  }

  const key = await photoVaultService.getOrCreateKey();
  const encryptedBytes = await wrAuthStorageService.downloadBytes(row.local_id);
  const decrypted = await decryptPhotoBytes(encryptedBytes, key);
  const dataUri = toDataUri(decrypted);
  photoSessionCache.set(row.id, dataUri);
  return dataUri;
};

const normalizeCategoryIds = (value: string | string[]) => {
  const raw = Array.isArray(value) ? value : [value];
  return raw.map(item => String(item)).filter(Boolean);
};

const listPhotoRows = async (categoryId?: string): Promise<PhotoRow[]> => {
  await ensureSynced();
  const rows = await wrAuthDataService.listPhotoMetadata();
  const filteredRows = categoryId
    ? rows.filter(row => parseCategoryIds(row.categories).includes(categoryId))
    : rows;

  const available: PhotoRow[] = [];
  for (const row of filteredRows) {
    const mapped: PhotoRow = {
      id: row.id,
      local_id: row.local_id,
      width: row.width,
      height: row.height,
      captured_at: row.captured_at,
      categories: row.categories,
    };

    if (isCloudPhotoRef(mapped.local_id)) {
      available.push(mapped);
      continue;
    }

    try {
      await wrAuthDataService.deletePhotoMetadata(mapped.id);
    } catch (error) {
      if (__DEV__) {
        console.warn('[photos] Failed to prune orphaned metadata row.', error);
      }
    }
  }
  return available;
};

const listPhotos = async (categoryId?: string): Promise<ProgressImage[]> => {
  const rows = await listPhotoRows(categoryId);
  const mapped: ProgressImage[] = [];
  for (const row of rows) {
    try {
      const resolvedUri = await resolveDisplayUri(row);
      if (!resolvedUri) {
        continue;
      }
      mapped.push(mapPhoto(row, resolvedUri));
    } catch (error) {
      if (__DEV__) {
        console.warn('[photos] Skipping photo that could not be decrypted.', row.id, error);
      }
    }
  }
  return mapped;
};

const savePhoto = async (
  imageUri: string,
  categories: string | string[],
  width: number = 0,
  height: number = 0
): Promise<ProgressImage> => {
  await ensureSynced();
  const capturedAt = new Date().toISOString();
  const normalizedCategoryIds = normalizeCategoryIds(categories);
  const compressed = await compressImageForStorage(imageUri);
  const key = await photoVaultService.getOrCreateKey();
  const sourceBytes = await readUriBytes(compressed.uri);
  const encryptedBytes = await encryptPhotoBytes(sourceBytes, key);
  const storageRef = await wrAuthStorageService.uploadBytes(
    'progress_photo',
    encryptedBytes,
    'application/octet-stream'
  );

  for (const uri of [imageUri, compressed.uri]) {
    if (uri.startsWith('file://')) {
      try {
        new File(uri).delete();
      } catch {}
    }
  }

  const photoWidth = compressed.width || width;
  const photoHeight = compressed.height || height;
  const remoteRow = await wrAuthDataService.createPhotoMetadata({
    local_id: storageRef,
    width: photoWidth,
    height: photoHeight,
    captured_at: capturedAt,
    categories: serializeCategoryIds(normalizedCategoryIds),
  });

  const dataUri = toDataUri(sourceBytes);
  photoSessionCache.set(remoteRow.id, dataUri);

  const row: PhotoRow = {
    id: remoteRow.id,
    local_id: storageRef,
    width: photoWidth,
    height: photoHeight,
    captured_at: capturedAt,
    categories: normalizedCategoryIds,
  };

  return mapPhoto(row, dataUri);
};

const findPhotoRow = (rows: PhotoRow[], id: string | number) => {
  const photoId = String(id);
  return rows.find(row => String(row.id) === photoId);
};

const deletePhoto = async (id: string | number): Promise<void> => {
  await ensureSynced();
  const photoId = String(id);
  const rows = await listPhotoRows();
  const data = findPhotoRow(rows, photoId);

  if (!data) {
    throw new Error('Photo not found. Pull to refresh and try again.');
  }

  await wrAuthDataService.deletePhotoMetadata(String(data.id));

  if (data.local_id && isWrAuthStorageRef(data.local_id)) {
    await wrAuthStorageService.deleteRef(data.local_id);
  }

  photoSessionCache.remove(photoId);
};

const updatePhotoCategories = async (id: string | number, categories: string[]): Promise<void> => {
  await ensureSynced();
  const normalizedCategoryIds = normalizeCategoryIds(categories);
  await wrAuthDataService.updatePhotoMetadata(String(id), {
    categories: serializeCategoryIds(normalizedCategoryIds),
  });
};

const removeCategoryFromPhotos = async (categoryId: string): Promise<void> => {
  await ensureSynced();
  const rows = await listPhotoRows();
  const photos = rows.filter(row => parseCategoryIds(row.categories).includes(categoryId));
  await Promise.all(
    photos.map(async photo => {
      const nextCategories = parseCategoryIds(photo.categories).filter(cat => cat !== categoryId);
      if (nextCategories.length === 0) {
        await deletePhoto(photo.id);
      } else {
        await updatePhotoCategories(photo.id, nextCategories);
      }
    })
  );
};

const listAvailablePhotoTimestamps = async (): Promise<number[]> => {
  const rows = await listPhotoRows();
  return rows
    .map(row => parseTimestampMs(row.captured_at))
    .filter(value => value > 0);
};

export type PhotoCategoryStat = {
  categories: string[];
  timestamp: number;
};

const listPhotoCategoryStats = async (): Promise<PhotoCategoryStat[]> => {
  const rows = await listPhotoRows();
  return rows.map(row => ({
    categories: parseCategoryIds(row.categories),
    timestamp: parseTimestampMs(row.captured_at),
  }));
};

export const photosService = {
  listPhotos,
  savePhoto,
  deletePhoto,
  removeCategoryFromPhotos,
  listAvailablePhotoTimestamps,
  listPhotoCategoryStats,
  warmVaultKey: () => photoVaultService.warmVaultKey(),
  clearSessionCache: () => photoSessionCache.clear(),
};
