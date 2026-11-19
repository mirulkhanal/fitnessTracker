import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { File, Paths } from 'expo-file-system';

import { base64ToBytes, bytesToBase64 } from '@/utils/bytes-base64';

const KEY_STORAGE_KEY = 'fitnesstracker_local_photo_key_v1';
const KEY_STORAGE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};
let cachedKey: Uint8Array | null = null;
let keyPromise: Promise<Uint8Array> | null = null;

export const photoVaultService = {
  async getOrCreateKey(): Promise<Uint8Array> {
    if (cachedKey) return cachedKey;
    if (keyPromise) return keyPromise;
    keyPromise = (async () => {
      const stored = await SecureStore.getItemAsync(KEY_STORAGE_KEY);
      if (stored) {
        const key = base64ToBytes(stored);
        if (key.length === 32) {
          cachedKey = key;
          return key;
        }
      }
      const legacyKeyFile = new File(Paths.document, 'photo-key.bin');
      if (legacyKeyFile.exists) {
        const legacyKey = await legacyKeyFile.bytes();
        if (legacyKey.length === 32) {
          await SecureStore.setItemAsync(KEY_STORAGE_KEY, bytesToBase64(legacyKey), KEY_STORAGE_OPTIONS);
          try { legacyKeyFile.delete(); } catch { /* SecureStore now holds the local key. */ }
          cachedKey = legacyKey;
          return legacyKey;
        }
      }
      const key = await Crypto.getRandomBytesAsync(32);
      await SecureStore.setItemAsync(KEY_STORAGE_KEY, bytesToBase64(key), KEY_STORAGE_OPTIONS);
      cachedKey = key;
      return key;
    })();
    try {
      return await keyPromise;
    } finally {
      keyPromise = null;
    }
  },

  async warmVaultKey(): Promise<void> {
    await this.getOrCreateKey();
  },

  clear(): void {
    cachedKey = null;
    keyPromise = null;
  },
};
