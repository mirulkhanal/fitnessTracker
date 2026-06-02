import AsyncStorage from '@react-native-async-storage/async-storage';

import { isWrAuthStorageRef } from '@/constants/wrauth-storage';
import { dataMigrationService } from '@/services/data-migration.service';
import { wrAuthDataService } from '@/services/wrauth-data.service';
import { wrAuthStorageService } from '@/services/wrauth-storage.service';
import { ProgressImage } from '@/types/photo.types';
import { base64ToBytes } from '@/utils/bytes-base64';
import { parseCategoryIds, serializeCategoryIds } from '@/utils/parse-category-ids';
import { parseTimestampMs } from '@/utils/parse-timestamp';
import * as Crypto from 'expo-crypto';
import { Directory, File, Paths, readAsStringAsync } from 'expo-file-system';

interface PhotoRow {
  id: string;
  local_id: string;
  width: number;
  height: number;
  captured_at: string;
  categories: unknown;
}
const ENCRYPTED_DIR = new Directory(Paths.document, 'encrypted-photos');
const PREVIEW_DIR = new Directory(Paths.cache, 'photo-previews');
const KEY_FILE = new File(Paths.document, 'photo-key.bin');
const VAULT_REF_STORAGE_KEY = '@fitnesstracker/photo_vault_storage_ref';

const toPublicUrl = (path: string) => {
  if (!path) {
    return '';
  }
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('file://') ||
    path.startsWith('content://') ||
    path.startsWith('ph://')
  ) {
    return path;
  }
  return path;
};

const mapPhoto = (row: PhotoRow, uriOverride?: string): ProgressImage => ({
  id: String(row.id),
  uri: uriOverride ?? toPublicUrl(row.local_id),
  width: row.width ?? 0,
  height: row.height ?? 0,
  timestamp: parseTimestampMs(row.captured_at),
  categories: parseCategoryIds(row.categories),
});

const ensureSynced = async () => {
  await dataMigrationService.migrateLocalDataToWrAuthIfNeeded();
};

const ensureStorageReady = () => {
  ENCRYPTED_DIR.create({ intermediates: true, idempotent: true });
  PREVIEW_DIR.create({ intermediates: true, idempotent: true });
};

const loadVaultKeyFromRemote = async (): Promise<Uint8Array | null> => {
  const storageRef = await AsyncStorage.getItem(VAULT_REF_STORAGE_KEY);
  if (!storageRef || !isWrAuthStorageRef(storageRef)) {
    return null;
  }
  try {
    return await wrAuthStorageService.downloadBytes(storageRef);
  } catch {
    return null;
  }
};

const persistVaultKeyToRemote = async (keyBytes: Uint8Array): Promise<void> => {
  const previousRef = await AsyncStorage.getItem(VAULT_REF_STORAGE_KEY);
  if (previousRef && isWrAuthStorageRef(previousRef)) {
    await wrAuthStorageService.deleteRef(previousRef).catch(() => undefined);
  }
  const storageRef = await wrAuthStorageService.uploadBytes(
    'photo_vault_key',
    keyBytes,
    'application/octet-stream'
  );
  await AsyncStorage.setItem(VAULT_REF_STORAGE_KEY, storageRef);
};

const getOrCreateKey = async () => {
  ensureStorageReady();
  if (!KEY_FILE.exists) {
    const remoteKey = await loadVaultKeyFromRemote();
    if (remoteKey && remoteKey.length === 32) {
      KEY_FILE.write(remoteKey);
      return remoteKey;
    }
    const keyBytes = await Crypto.getRandomBytesAsync(32);
    KEY_FILE.write(keyBytes);
    void persistVaultKeyToRemote(keyBytes).catch(error => {
      if (__DEV__) {
        console.warn('[photos] Failed to sync vault key to wrAuth.', error);
      }
    });
    return keyBytes;
  }
  return await KEY_FILE.bytes();
};

const concatBytes = (...parts: Uint8Array[]) => {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const combined = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    combined.set(part, offset);
    offset += part.length;
  }
  return combined;
};

const xorBytes = (left: Uint8Array, right: Uint8Array) => {
  const output = new Uint8Array(left.length);
  for (let i = 0; i < left.length; i += 1) {
    output[i] = left[i] ^ right[i];
  }
  return output;
};

const deriveKeystream = async (key: Uint8Array, nonce: Uint8Array, length: number) => {
  const blockSize = 32;
  const blocks = Math.ceil(length / blockSize);
  const output = new Uint8Array(length);
  let offset = 0;

  for (let index = 0; index < blocks; index += 1) {
    const counter = new Uint8Array(4);
    counter[0] = (index >>> 24) & 255;
    counter[1] = (index >>> 16) & 255;
    counter[2] = (index >>> 8) & 255;
    counter[3] = index & 255;
    const seed = concatBytes(key, nonce, counter);
    const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, seed);
    const block = new Uint8Array(digest);
    const slice = block.slice(0, Math.min(block.length, length - offset));
    output.set(slice, offset);
    offset += slice.length;
  }

  return output;
};

const encryptBytes = async (data: Uint8Array, key: Uint8Array) => {
  const nonce = await Crypto.getRandomBytesAsync(16);
  const keystream = await deriveKeystream(key, nonce, data.length);
  const encrypted = xorBytes(data, keystream);
  return concatBytes(nonce, encrypted);
};

const decryptBytes = async (payload: Uint8Array, key: Uint8Array) => {
  const nonce = payload.slice(0, 16);
  const encrypted = payload.slice(16);
  const keystream = await deriveKeystream(key, nonce, encrypted.length);
  return xorBytes(encrypted, keystream);
};

const getExtensionFromUri = (uri: string) => {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
  return match?.[1]?.toLowerCase() ?? 'jpg';
};

const readUriBytes = async (uri: string) => {
  if (uri.startsWith('file://')) {
    return await new File(uri).bytes();
  }
  const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
  return base64ToBytes(base64);
};

const isEncryptedUri = (uri: string) => uri.includes('/encrypted-photos/') && uri.endsWith('.enc');

const localFileExists = (uri: string): boolean => {
  if (!uri.startsWith('file://')) {
    return false;
  }
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
};

const materializeStorageRef = async (storageRef: string): Promise<string> => {
  const encryptedBytes = await wrAuthStorageService.downloadBytes(storageRef);
  const encryptedFile = getEncryptedFile(storageRef);
  encryptedFile.write(encryptedBytes);
  return encryptedFile.uri;
};

const uploadEncryptedFileToStorage = async (encryptedUri: string): Promise<string> => {
  const encryptedBytes = await new File(encryptedUri).bytes();
  return await wrAuthStorageService.uploadBytes(
    'progress_photo',
    encryptedBytes,
    'application/octet-stream'
  );
};

const syncLocalRowsToRemoteStorage = async (rows: PhotoRow[]): Promise<void> => {
  for (const row of rows) {
    if (isWrAuthStorageRef(row.local_id)) {
      continue;
    }
    if (!row.local_id.startsWith('file://') || !localFileExists(row.local_id)) {
      continue;
    }
    try {
      const storageRef = await uploadEncryptedFileToStorage(row.local_id);
      await wrAuthDataService.updatePhotoMetadata(row.id, { local_id: storageRef });
      row.local_id = storageRef;
    } catch (error) {
      if (__DEV__) {
        console.warn('[photos] Failed to upload photo blob to wrAuth.', error);
      }
    }
  }
};

const getEncryptedFile = (sourceUri: string) => {
  const extension = getExtensionFromUri(sourceUri);
  const fileName = `${Crypto.randomUUID()}.${extension}.enc`;
  return new File(ENCRYPTED_DIR, fileName);
};

const getPreviewFileForEncrypted = (encryptedUri: string) => {
  const encryptedFile = new File(encryptedUri);
  const previewName = encryptedFile.name.endsWith('.enc')
    ? encryptedFile.name.slice(0, -4)
    : encryptedFile.name;
  return new File(PREVIEW_DIR, previewName);
};

const ensurePreviewUri = async (encryptedUri: string) => {
  const previewFile = getPreviewFileForEncrypted(encryptedUri);
  if (previewFile.exists) {
    return previewFile.uri;
  }
  const key = await getOrCreateKey();
  const encryptedBytes = await new File(encryptedUri).bytes();
  const decrypted = await decryptBytes(encryptedBytes, key);
  previewFile.write(decrypted);
  return previewFile.uri;
};

const migrateToEncrypted = async (row: PhotoRow) => {
  if (!row.local_id || !row.local_id.startsWith('file://') || isEncryptedUri(row.local_id)) {
    return row.local_id;
  }
  const key = await getOrCreateKey();
  const sourceBytes = await readUriBytes(row.local_id);
  const encryptedFile = getEncryptedFile(row.local_id);
  const encryptedBytes = await encryptBytes(sourceBytes, key);
  encryptedFile.write(encryptedBytes);
  await wrAuthDataService.updatePhotoMetadata(row.id, { local_id: encryptedFile.uri });
  try {
    new File(row.local_id).delete();
  } catch {}
  return encryptedFile.uri;
};

const resolvePhotoUri = async (row: PhotoRow): Promise<string | null> => {
  if (row.local_id.startsWith('http://') || row.local_id.startsWith('https://')) {
    return toPublicUrl(row.local_id);
  }

  let encryptedUri = row.local_id;
  if (isWrAuthStorageRef(row.local_id)) {
    if (!localFileExists(encryptedUri)) {
      encryptedUri = await materializeStorageRef(row.local_id);
    }
  } else {
    encryptedUri = await migrateToEncrypted(row);
    if (localFileExists(encryptedUri) && !isWrAuthStorageRef(row.local_id)) {
      try {
        const storageRef = await uploadEncryptedFileToStorage(encryptedUri);
        await wrAuthDataService.updatePhotoMetadata(row.id, { local_id: storageRef });
        row.local_id = storageRef;
      } catch (error) {
        if (__DEV__) {
          console.warn('[photos] Failed to backfill remote photo storage.', error);
        }
      }
    }
  }

  if (!localFileExists(encryptedUri) && !isWrAuthStorageRef(row.local_id)) {
    return null;
  }

  if (isEncryptedUri(encryptedUri)) {
    return await ensurePreviewUri(encryptedUri);
  }
  return toPublicUrl(encryptedUri);
};

const isPhotoRowAvailable = (row: PhotoRow): boolean => {
  if (isWrAuthStorageRef(row.local_id)) {
    return true;
  }
  if (row.local_id.startsWith('http://') || row.local_id.startsWith('https://')) {
    return true;
  }
  return localFileExists(row.local_id);
};

const normalizeCategoryIds = (value: string | string[]) => {
  const raw = Array.isArray(value) ? value : [value];
  return raw.map(item => String(item)).filter(Boolean);
};

const listPhotoRows = async (): Promise<PhotoRow[]> => {
  await ensureSynced();
  const rows = await wrAuthDataService.listPhotoMetadata();
  const mapped = rows.map(row => ({
    id: row.id,
    local_id: row.local_id,
    width: row.width,
    height: row.height,
    captured_at: row.captured_at,
    categories: row.categories,
  }));
  await syncLocalRowsToRemoteStorage(mapped);

  const available: PhotoRow[] = [];
  for (const row of mapped) {
    if (isPhotoRowAvailable(row)) {
      available.push(row);
      continue;
    }
    try {
      await wrAuthDataService.deletePhotoMetadata(row.id);
      if (isWrAuthStorageRef(row.local_id)) {
        await wrAuthStorageService.deleteRef(row.local_id);
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[photos] Failed to prune orphaned metadata row.', error);
      }
    }
  }
  return available;
};

const listPhotos = async (categoryId?: string): Promise<ProgressImage[]> => {
  const rows = await listPhotoRows();
  const filtered = categoryId
    ? rows.filter(row => parseCategoryIds(row.categories).includes(categoryId))
    : rows;
  const mapped: ProgressImage[] = [];
  for (const row of filtered) {
    const resolvedUri = await resolvePhotoUri(row);
    if (!resolvedUri) {
      continue;
    }
    mapped.push(mapPhoto(row, resolvedUri));
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
  const key = await getOrCreateKey();
  const sourceBytes = await readUriBytes(imageUri);
  const encryptedFile = getEncryptedFile(imageUri);
  const encryptedBytes = await encryptBytes(sourceBytes, key);
  encryptedFile.write(encryptedBytes);
  const storageRef = await uploadEncryptedFileToStorage(encryptedFile.uri);
  if (imageUri.startsWith('file://') && !isEncryptedUri(imageUri)) {
    try {
      new File(imageUri).delete();
    } catch {}
  }

  const categoriesJson = serializeCategoryIds(normalizedCategoryIds);
  const remoteRow = await wrAuthDataService.createPhotoMetadata({
    local_id: storageRef,
    width,
    height,
    captured_at: capturedAt,
    categories: categoriesJson,
  });

  const row: PhotoRow = {
    id: remoteRow.id,
    local_id: storageRef,
    width,
    height,
    captured_at: capturedAt,
    categories: normalizedCategoryIds,
  };

  const previewUri = await ensurePreviewUri(encryptedFile.uri);
  return mapPhoto(row, previewUri);
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

  if (data.local_id && data.local_id.startsWith('file://')) {
    try {
      new File(data.local_id).delete();
    } catch {}
  }
  if (data.local_id && isEncryptedUri(data.local_id)) {
    const previewFile = getPreviewFileForEncrypted(data.local_id);
    if (previewFile.exists) {
      try {
        previewFile.delete();
      } catch {}
    }
  }
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

export const photosService = {
  listPhotos,
  savePhoto,
  deletePhoto,
  removeCategoryFromPhotos,
  listAvailablePhotoTimestamps,
};
