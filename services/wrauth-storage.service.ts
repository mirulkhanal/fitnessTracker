import { bytesToBase64, base64ToBytes } from '@/utils/bytes-base64';
import { toWrAuthStorageRef } from '@/constants/wrauth-storage';
import { executeWithAccessTokenRetry } from '@/services/wrauth-session-refresh.service';
import { wrAuthClient, WrAuthRequestError } from '@/services/wrauth.client';

export type WrAuthStoragePurpose = 'avatar' | 'progress_photo' | 'photo_vault_key';

const withAccessToken = <T>(operation: (accessToken: string) => Promise<T>): Promise<T> =>
  executeWithAccessTokenRetry(operation);

export const wrAuthStorageService = {
  async uploadBytes(
    purpose: WrAuthStoragePurpose,
    bytes: Uint8Array,
    contentType: string
  ): Promise<string> {
    const object = await withAccessToken(accessToken =>
      wrAuthClient.createStorageObject(accessToken, {
        purpose,
        content_type: contentType,
        data_base64: bytesToBase64(bytes),
      })
    );
    return toWrAuthStorageRef(object.id);
  },

  async downloadBytes(storageRef: string): Promise<Uint8Array> {
    const base64 = await withAccessToken(accessToken =>
      wrAuthClient.downloadStorageObject(accessToken, storageRef)
    );
    return base64ToBytes(base64);
  },

  async deleteRef(storageRef: string): Promise<void> {
    if (!storageRef.startsWith('wrauth-storage://')) {
      return;
    }
    try {
      await withAccessToken(accessToken =>
        wrAuthClient.deleteStorageObject(accessToken, storageRef)
      );
    } catch (error) {
      if (error instanceof WrAuthRequestError && error.code === 'STORAGE_NOT_FOUND') {
        return;
      }
      throw error;
    }
  },
};
