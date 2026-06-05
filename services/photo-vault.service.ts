import AsyncStorage from '@react-native-async-storage/async-storage';

import { isWrAuthStorageRef } from '@/constants/wrauth-storage';
import { wrAuthDataService } from '@/services/wrauth-data.service';
import { wrAuthStorageService } from '@/services/wrauth-storage.service';
import * as Crypto from 'expo-crypto';

const VAULT_REF_STORAGE_KEY = '@fitnesstracker/photo_vault_storage_ref';

let sessionKey: Uint8Array | null = null;

const resolveVaultKeyStorageRef = async (): Promise<string | null> => {
  const cachedRef = await AsyncStorage.getItem(VAULT_REF_STORAGE_KEY);
  if (cachedRef && isWrAuthStorageRef(cachedRef)) {
    return cachedRef;
  }

  const remoteRef = await wrAuthStorageService.findLatestRefByPurpose('photo_vault_key');
  if (remoteRef) {
    await AsyncStorage.setItem(VAULT_REF_STORAGE_KEY, remoteRef);
    return remoteRef;
  }

  return null;
};

const loadVaultKeyFromRemote = async (): Promise<Uint8Array | null> => {
  const storageRef = await resolveVaultKeyStorageRef();
  if (!storageRef) {
    return null;
  }
  try {
    const keyBytes = await wrAuthStorageService.downloadBytes(storageRef);
    return keyBytes.length === 32 ? keyBytes : null;
  } catch {
    return null;
  }
};

const hasRemoteEncryptedPhotos = async (): Promise<boolean> => {
  const rows = await wrAuthDataService.listPhotoMetadata();
  return rows.some(row => isWrAuthStorageRef(row.local_id));
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

export const photoVaultService = {
  async getOrCreateKey(): Promise<Uint8Array> {
    if (sessionKey) {
      return sessionKey;
    }

    const remoteKey = await loadVaultKeyFromRemote();
    if (remoteKey) {
      sessionKey = remoteKey;
      return remoteKey;
    }

    if (await hasRemoteEncryptedPhotos()) {
      throw new Error(
        'Could not restore your photo encryption key from your account. Sign in on the device where you added photos, or contact support.'
      );
    }

    const keyBytes = await Crypto.getRandomBytesAsync(32);
    sessionKey = keyBytes;
    void persistVaultKeyToRemote(keyBytes).catch(error => {
      if (__DEV__) {
        console.warn('[photos] Failed to sync vault key to wrAuth.', error);
      }
    });
    return keyBytes;
  },

  async warmVaultKey(): Promise<void> {
    await this.getOrCreateKey();
  },

  clear(): void {
    sessionKey = null;
  },

  async clearStoredVaultRef(): Promise<void> {
    await AsyncStorage.removeItem(VAULT_REF_STORAGE_KEY);
  },
};
