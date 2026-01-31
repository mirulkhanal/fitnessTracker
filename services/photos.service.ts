import { supabase } from '@/services/supabase.client';
import { ProgressImage } from '@/types/photo.types';
import * as Crypto from 'expo-crypto';
import { Directory, File, Paths, readAsStringAsync } from 'expo-file-system';

interface PhotoRow {
  id: string | number;
  user_id: string;
  local_id: string;
  width: number | null;
  height: number | null;
  captured_at: number | string;
  categories: Array<string | number> | null;
}

const PHOTOS_TABLE = 'photo_metadata';
const ENCRYPTED_DIR = new Directory(Paths.document, 'encrypted-photos');
const PREVIEW_DIR = new Directory(Paths.cache, 'photo-previews');
const KEY_FILE = new File(Paths.document, 'photo-key.bin');

const getUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }
  const userId = data.user?.id;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
};

const normalizeTimestamp = (value: number | string) => {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

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
  timestamp: normalizeTimestamp(row.captured_at),
  categories: (row.categories ?? []).map(category => String(category)),
});

const ensureStorageReady = () => {
  ENCRYPTED_DIR.create({ intermediates: true, idempotent: true });
  PREVIEW_DIR.create({ intermediates: true, idempotent: true });
};

const getOrCreateKey = async () => {
  ensureStorageReady();
  if (!KEY_FILE.exists) {
    const keyBytes = await Crypto.getRandomBytesAsync(32);
    KEY_FILE.write(keyBytes);
  }
  return await KEY_FILE.bytes();
};

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const base64ToBytes = (base64: string) => {
  const cleaned = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  const padding = cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0;
  const byteLength = (cleaned.length * 3) / 4 - padding;
  const bytes = new Uint8Array(byteLength);
  let byteIndex = 0;

  for (let i = 0; i < cleaned.length; i += 4) {
    const enc1 = BASE64_ALPHABET.indexOf(cleaned[i]);
    const enc2 = BASE64_ALPHABET.indexOf(cleaned[i + 1]);
    const enc3 = BASE64_ALPHABET.indexOf(cleaned[i + 2]);
    const enc4 = BASE64_ALPHABET.indexOf(cleaned[i + 3]);
    const block =
      ((enc1 & 63) << 18) |
      ((enc2 & 63) << 12) |
      (((enc3 >= 0 ? enc3 : 0) & 63) << 6) |
      ((enc4 >= 0 ? enc4 : 0) & 63);

    if (byteIndex < byteLength) bytes[byteIndex++] = (block >> 16) & 255;
    if (byteIndex < byteLength) bytes[byteIndex++] = (block >> 8) & 255;
    if (byteIndex < byteLength) bytes[byteIndex++] = block & 255;
  }

  return bytes;
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
  const { error } = await supabase
    .from(PHOTOS_TABLE)
    .update({ local_id: encryptedFile.uri })
    .eq('id', normalizePhotoId(row.id))
    .eq('user_id', row.user_id);
  if (error) {
    throw new Error(error.message);
  }
  try {
    new File(row.local_id).delete();
  } catch {}
  return encryptedFile.uri;
};

const resolvePhotoUri = async (row: PhotoRow) => {
  if (row.local_id.startsWith('http://') || row.local_id.startsWith('https://')) {
    return toPublicUrl(row.local_id);
  }
  const encryptedUri = await migrateToEncrypted(row);
  if (isEncryptedUri(encryptedUri)) {
    return await ensurePreviewUri(encryptedUri);
  }
  return toPublicUrl(encryptedUri);
};

const normalizeCategoryIds = (value: string | string[]) => {
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .map(item => {
      const numeric = Number(item);
      return Number.isFinite(numeric) ? numeric : null;
    })
    .filter((item): item is number => item !== null);
};

const normalizePhotoId = (value: string | number) => {
  if (typeof value === 'number') {
    return value;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
};

const listPhotos = async (categoryId?: string): Promise<ProgressImage[]> => {
  const userId = await getUserId();
  let query = supabase
    .from(PHOTOS_TABLE)
    .select('id, local_id, width, height, captured_at, categories, user_id')
    .eq('user_id', userId)
    .order('captured_at', { ascending: false });

  if (categoryId) {
    const normalizedCategoryIds = normalizeCategoryIds(categoryId);
    if (normalizedCategoryIds.length > 0) {
      query = query.contains('categories', normalizedCategoryIds);
    }
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as PhotoRow[];
  const mapped = await Promise.all(
    rows.map(async row => {
      const resolvedUri = await resolvePhotoUri(row);
      return mapPhoto(row, resolvedUri);
    })
  );
  return mapped;
};

const savePhoto = async (
  imageUri: string,
  categories: string | string[],
  width: number = 0,
  height: number = 0
): Promise<ProgressImage> => {
  const userId = await getUserId();
  const capturedAt = new Date().toISOString();
  const normalizedCategoryIds = normalizeCategoryIds(categories);
  const key = await getOrCreateKey();
  const sourceBytes = await readUriBytes(imageUri);
  const encryptedFile = getEncryptedFile(imageUri);
  const encryptedBytes = await encryptBytes(sourceBytes, key);
  encryptedFile.write(encryptedBytes);
  if (imageUri.startsWith('file://') && !isEncryptedUri(imageUri)) {
    try {
      new File(imageUri).delete();
    } catch {}
  }

  const payload = {
    user_id: userId,
    local_id: encryptedFile.uri,
    width,
    height,
    captured_at: capturedAt,
    categories: normalizedCategoryIds,
  };

  const { data, error } = await supabase
    .from(PHOTOS_TABLE)
    .insert(payload)
    .select('id, local_id, width, height, captured_at, categories, user_id')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to save photo');
  }

  const previewUri = await ensurePreviewUri(encryptedFile.uri);
  return mapPhoto(data as PhotoRow, previewUri);
};

const deletePhoto = async (id: string | number): Promise<void> => {
  const userId = await getUserId();
  const normalizedPhotoId = normalizePhotoId(id);
  const { data, error } = await supabase
    .from(PHOTOS_TABLE)
    .select('id, local_id, user_id')
    .eq('id', normalizedPhotoId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return;
  }

  const { error: deleteError } = await supabase
    .from(PHOTOS_TABLE)
    .delete()
    .eq('id', normalizedPhotoId)
    .eq('user_id', userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (data?.local_id && data.local_id.startsWith('file://')) {
    try {
      new File(data.local_id).delete();
    } catch {}
  }
  if (data?.local_id && isEncryptedUri(data.local_id)) {
    const previewFile = getPreviewFileForEncrypted(data.local_id);
    if (previewFile.exists) {
      try {
        previewFile.delete();
      } catch {}
    }
  }

};

const updatePhotoCategories = async (id: string | number, categories: string[]): Promise<void> => {
  const userId = await getUserId();
  const normalizedCategoryIds = normalizeCategoryIds(categories);
  const normalizedPhotoId = normalizePhotoId(id);
  const { error } = await supabase
    .from(PHOTOS_TABLE)
    .update({ categories: normalizedCategoryIds })
    .eq('id', normalizedPhotoId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
};

const removeCategoryFromPhotos = async (categoryId: string): Promise<void> => {
  const userId = await getUserId();
  const normalizedCategoryIds = normalizeCategoryIds(categoryId);
  if (normalizedCategoryIds.length === 0) {
    return;
  }
  const { data, error } = await supabase
    .from(PHOTOS_TABLE)
    .select('id, categories, user_id')
    .eq('user_id', userId)
    .contains('categories', normalizedCategoryIds);

  if (error) {
    throw new Error(error.message);
  }

  const photos = (data ?? []) as Array<{ id: string | number; categories: Array<string | number> | null }>;
  await Promise.all(
    photos.map(async photo => {
      const nextCategories = (photo.categories ?? [])
        .map(category => String(category))
        .filter(cat => cat !== categoryId);
      if (nextCategories.length === 0) {
        await deletePhoto(photo.id);
      } else {
        await updatePhotoCategories(photo.id, nextCategories);
      }
    })
  );
};

export const photosService = {
  listPhotos,
  savePhoto,
  deletePhoto,
  removeCategoryFromPhotos,
};
