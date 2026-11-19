import { strToU8, zipSync } from 'fflate';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

import { getDatabase } from '@/services/database.service';
import { localProfileService } from '@/services/local-profile.service';
import { photoVaultService } from '@/services/photo-vault.service';
import { parseCategoryIds } from '@/utils/parse-category-ids';
import { decryptPhotoBytes, isPlainPhotoBytes } from '@/utils/photo-crypto';

const UNSORTED_FOLDER = '_Unsorted';

const sanitizeFolderName = (name: string): string => {
  const trimmed = name.trim();
  return (trimmed || 'FitTrack Export').replace(/[^a-zA-Z0-9 _-]/g, '_');
};

const formatPhotoFilename = (capturedAt: string, photoId: string, png = false): string => {
  const date = new Date(capturedAt);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const idPart = photoId.replace(/-/g, '').slice(0, 8);
  return `${yyyy}-${mm}-${dd}_${hh}${min}${ss}_${idPart}.${png ? 'png' : 'jpg'}`;
};

export const dataExportService = {
  async exportUserDataZip(): Promise<void> {
    const db = getDatabase();
    const profile = await localProfileService.get();
    const categories = db.getAllSync<{ id: string; name: string; color: string; icon: string }>(
      'SELECT id, name, color, icon FROM categories ORDER BY created_at ASC'
    );
    const photos = db.getAllSync<{
      id: string; local_id: string; width: number; height: number; captured_at: string; categories: string;
    }>('SELECT id, local_id, width, height, captured_at, categories FROM photo_metadata ORDER BY captured_at ASC');

    const categoryNameById = new Map(categories.map(category => [category.id, sanitizeFolderName(category.name)]));
    const displayName = profile.display_name.trim() || 'FitTrack Export';
    const rootFolder = `${sanitizeFolderName(displayName)}/`;
    const entries: Record<string, Uint8Array> = {};
    const errors: Array<{ photo_id: string; reason: string }> = [];
    let exportedPhotoCount = 0;
    const vaultKey = await photoVaultService.getOrCreateKey();

    for (const photo of photos) {
      if (!photo.local_id.startsWith('file://')) {
        errors.push({ photo_id: photo.id, reason: 'This photo is not stored on this device.' });
        continue;
      }
      try {
        const file = new File(photo.local_id);
        if (!file.exists) throw new Error('missing');
        const storedBytes = await file.bytes();
        const photoBytes = isPlainPhotoBytes(storedBytes)
          ? storedBytes
          : await decryptPhotoBytes(storedBytes, vaultKey);
        const png = photoBytes[0] === 0x89 && photoBytes[1] === 0x50 && photoBytes[2] === 0x4e && photoBytes[3] === 0x47;
        const filename = formatPhotoFilename(photo.captured_at, photo.id, png);
        const categoryIds = parseCategoryIds(photo.categories);
        const folderNames = categoryIds
          .map(id => categoryNameById.get(id))
          .filter((name): name is string => Boolean(name));
        for (const folderName of folderNames.length ? folderNames : [UNSORTED_FOLDER]) {
          entries[`${rootFolder}${folderName}/${filename}`] = photoBytes;
        }
        exportedPhotoCount += 1;
      } catch {
        errors.push({ photo_id: photo.id, reason: 'The local photo file could not be read.' });
      }
    }

    for (const category of categories) {
      const folderName = sanitizeFolderName(category.name);
      if (!Object.keys(entries).some(path => path.startsWith(`${rootFolder}${folderName}/`))) {
        entries[`${rootFolder}${folderName}/.gitkeep`] = strToU8('\n');
      }
    }

    let avatarIncluded = false;
    if (profile.avatar_url?.startsWith('file://')) {
      try {
        const avatar = new File(profile.avatar_url);
        if (avatar.exists) {
          const ext = profile.avatar_url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
          entries[`${rootFolder}profile/avatar.${ext}`] = await avatar.bytes();
          avatarIncluded = true;
        }
      } catch { /* Keep profile metadata in the export if the avatar is unavailable. */ }
    }
    entries[`${rootFolder}profile.json`] = strToU8(JSON.stringify({
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_included: avatarIncluded,
    }, null, 2));
    entries[`${rootFolder}categories.json`] = strToU8(JSON.stringify(categories, null, 2));
    if (errors.length) entries[`${rootFolder}export-notes.json`] = strToU8(JSON.stringify(errors, null, 2));
    entries[`${rootFolder}manifest.json`] = strToU8(JSON.stringify({
      format: 'fittrack_local_export_v1',
      exported_at: new Date().toISOString(),
      display_name: displayName,
      photo_count: exportedPhotoCount,
      skipped_photos: errors.length,
    }, null, 2));

    const safeLabel = sanitizeFolderName(displayName);
    const fileName = `${safeLabel}-fittrack-export-${Date.now()}.zip`;
    const exportFile = new File(Paths.cache, fileName);
    if (exportFile.exists) exportFile.delete();
    exportFile.create({ overwrite: true });
    exportFile.write(zipSync(entries, { level: 6 }));

    if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device.');
    await Sharing.shareAsync(exportFile.uri, {
      mimeType: 'application/zip',
      dialogTitle: 'Export FitTrack data',
    });
  },
};
