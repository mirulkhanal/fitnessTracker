import { toWrAuthStorageRef } from '@/constants/wrauth-storage';
import { executeWithAccessTokenRetry } from '@/services/wrauth-session-refresh.service';
import { wrAuthClient, WrAuthRequestError } from '@/services/wrauth.client';
import { bytesToBase64, base64ToBytes } from '@/utils/bytes-base64';

export type WrAuthStoragePurpose = 'avatar' | 'progress_photo' | 'photo_vault_key';

type WrAuthStorageObjectSummary = {
  id: string;
  purpose: string;
  content_type: string;
  byte_size: number;
  created_at: string;
};

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

  async listObjects(purpose?: WrAuthStoragePurpose): Promise<WrAuthStorageObjectSummary[]> {
    return withAccessToken(accessToken => wrAuthClient.listStorageObjects(accessToken, purpose));
  },

  async findLatestRefByPurpose(purpose: WrAuthStoragePurpose): Promise<string | null> {
    try {
      const objects = await this.listObjects(purpose);
      if (objects.length === 0) {
        return null;
      }
      const latest = objects.reduce((current, candidate) =>
        candidate.created_at > current.created_at ? candidate : current
      );
      return toWrAuthStorageRef(latest.id);
    } catch (error) {
      if (error instanceof WrAuthRequestError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
