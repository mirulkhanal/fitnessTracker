import { Directory, File, Paths } from 'expo-file-system';
import * as Crypto from 'expo-crypto';

import { getDatabase } from '@/services/database.service';
import { photoSessionCache } from '@/services/photo-session-cache.service';
import { photoVaultService } from '@/services/photo-vault.service';
import { ProgressImage } from '@/types/photo.types';
import { bytesToBase64 } from '@/utils/bytes-base64';
import { parseCategoryIds, serializeCategoryIds } from '@/utils/parse-category-ids';
import { compressImageForStorage } from '@/utils/compress-image';
import { parseTimestampMs } from '@/utils/parse-timestamp';
import { decryptPhotoBytes, encryptPhotoBytes, isPlainPhotoBytes } from '@/utils/photo-crypto';

interface PhotoRow {
  id: string;
  local_id: string;
  width: number;
  height: number;
  captured_at: string;
  categories: unknown;
}

const PHOTO_DIRECTORY_NAME = 'progress-photos';
const JPEG_DATA_URI_PREFIX = 'data:image/jpeg;base64,';
const toDataUri = (bytes: Uint8Array) => {
  const isPng = bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  return `${isPng ? 'data:image/png;base64,' : JPEG_DATA_URI_PREFIX}${bytesToBase64(bytes)}`;
};

const mapPhoto = (row: PhotoRow, uriOverride?: string): ProgressImage => ({
  id: String(row.id),
  uri: uriOverride ?? row.local_id,
  width: row.width ?? 0,
  height: row.height ?? 0,
  timestamp: parseTimestampMs(row.captured_at),
  categories: parseCategoryIds(row.categories),
});

const normalizeCategoryIds = (value: string | string[]) => {
  const raw = Array.isArray(value) ? value : [value];
  return raw.map(item => String(item)).filter(Boolean);
};

const localPhotoDirectory = (): Directory => {
  const dir = new Directory(Paths.document, PHOTO_DIRECTORY_NAME);
  if (!dir.exists) dir.create();
  return dir;
};

const readLocalPhoto = async (row: PhotoRow): Promise<string | null> => {
  if (!row.local_id.startsWith('file://')) return null;
  const cached = photoSessionCache.get(row.id);
  if (cached) return cached;

  const file = new File(row.local_id);
  if (!file.exists) return null;
  const storedBytes = await file.bytes();
  let decrypted = storedBytes as Uint8Array;
  if (!isPlainPhotoBytes(storedBytes)) {
    const key = await photoVaultService.getOrCreateKey();
    decrypted = await decryptPhotoBytes(storedBytes, key);
  }
  const dataUri = toDataUri(decrypted);
  photoSessionCache.set(row.id, dataUri);
  return dataUri;
};

const listPhotoRows = (categoryId?: string): PhotoRow[] => {
  const db = getDatabase();
  const rows = db.getAllSync<PhotoRow>(
    'SELECT id, local_id, width, height, captured_at, categories FROM photo_metadata ORDER BY captured_at DESC'
  );
  return categoryId
    ? rows.filter(row => parseCategoryIds(row.categories).includes(categoryId))
    : rows;
};

const hasLocalPhotoFile = (row: PhotoRow): boolean => {
  if (!row.local_id.startsWith('file://')) return false;
  try { return new File(row.local_id).exists; } catch { return false; }
};

const listPhotos = async (categoryId?: string): Promise<ProgressImage[]> => {
  const mapped: ProgressImage[] = [];
  for (const row of listPhotoRows(categoryId)) {
    try {
      const uri = await readLocalPhoto(row);
      if (uri) mapped.push(mapPhoto(row, uri));
    } catch (error) {
      if (__DEV__) console.warn('[photos] Skipping photo that could not be opened.', row.id, error);
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
  const db = getDatabase();
  const capturedAt = new Date().toISOString();
  const photoId = Crypto.randomUUID();
  const normalizedCategoryIds = normalizeCategoryIds(categories);
  const compressed = await compressImageForStorage(imageUri);
  const compressedFile = new File(compressed.uri);
  const sourceBytes = await compressedFile.bytes();
  if (compressed.uri.startsWith('file://') && compressed.uri !== imageUri) {
    try { compressedFile.delete(); } catch { /* Cache cleanup is best effort. */ }
  }
  const key = await photoVaultService.getOrCreateKey();
  const encryptedBytes = await encryptPhotoBytes(sourceBytes, key);

  const photoFile = new File(localPhotoDirectory(), `${photoId}.ft2`);
  photoFile.create({ overwrite: true });
  photoFile.write(encryptedBytes);

  const photoWidth = compressed.width || width;
  const photoHeight = compressed.height || height;
  db.runSync(
    `INSERT INTO photo_metadata (id, local_id, width, height, captured_at, categories)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [photoId, photoFile.uri, photoWidth, photoHeight, capturedAt, serializeCategoryIds(normalizedCategoryIds)]
  );

  const dataUri = toDataUri(sourceBytes);
  photoSessionCache.set(photoId, dataUri);
  return mapPhoto({
    id: photoId,
    local_id: photoFile.uri,
    width: photoWidth,
    height: photoHeight,
    captured_at: capturedAt,
    categories: normalizedCategoryIds,
  }, dataUri);
};

const deletePhoto = async (id: string | number): Promise<void> => {
  const photoId = String(id);
  const db = getDatabase();
  const row = db.getFirstSync<PhotoRow>(
    'SELECT id, local_id, width, height, captured_at, categories FROM photo_metadata WHERE id = ?',
    [photoId]
  );
  if (!row) throw new Error('Photo not found. Pull to refresh and try again.');
  db.runSync('DELETE FROM photo_metadata WHERE id = ?', [photoId]);
  if (row.local_id.startsWith('file://')) {
    try {
      const file = new File(row.local_id);
      if (file.exists) file.delete();
    } catch { /* Best effort removal of the corresponding local photo file. */ }
  }
  photoSessionCache.remove(photoId);
};

const updatePhotoCategories = async (id: string | number, categories: string[]): Promise<void> => {
  getDatabase().runSync(
    'UPDATE photo_metadata SET categories = ? WHERE id = ?',
    [serializeCategoryIds(normalizeCategoryIds(categories)), String(id)]
  );
};

const removeCategoryFromPhotos = async (categoryId: string): Promise<void> => {
  const photos = listPhotoRows().filter(row => parseCategoryIds(row.categories).includes(categoryId));
  for (const photo of photos) {
    const nextCategories = parseCategoryIds(photo.categories).filter(cat => cat !== categoryId);
    if (nextCategories.length === 0) await deletePhoto(photo.id);
    else await updatePhotoCategories(photo.id, nextCategories);
  }
};

const listAvailablePhotoTimestamps = async (): Promise<number[]> =>
  listPhotoRows()
    .filter(hasLocalPhotoFile)
    .map(row => parseTimestampMs(row.captured_at))
    .filter(value => value > 0);

export type PhotoCategoryStat = { categories: string[]; timestamp: number };

const listPhotoCategoryStats = async (): Promise<PhotoCategoryStat[]> =>
  listPhotoRows()
    .filter(hasLocalPhotoFile)
    .map(row => ({
      categories: parseCategoryIds(row.categories),
      timestamp: parseTimestampMs(row.captured_at),
    }));

export const photosService = {
  listPhotos,
  savePhoto,
  deletePhoto,
  updatePhotoCategories,
  removeCategoryFromPhotos,
  listAvailablePhotoTimestamps,
  listPhotoCategoryStats,
  warmVaultKey: () => photoVaultService.warmVaultKey(),
  clearSessionCache: () => photoSessionCache.clear(),
};
