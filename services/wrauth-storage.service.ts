import { authSessionService } from '@/services/auth-session.service';
import { bytesToBase64, base64ToBytes } from '@/utils/bytes-base64';
import { toWrAuthStorageRef } from '@/constants/wrauth-storage';
import { wrAuthClient, WrAuthRequestError } from '@/services/wrauth.client';

export type WrAuthStoragePurpose = 'avatar' | 'progress_photo' | 'photo_vault_key';

const getAccessToken = async (): Promise<string> => {
  const token = await authSessionService.getAccessToken();
  if (!token) {
    throw new Error('Sign in required');
  }
  return token;
};

export const wrAuthStorageService = {
  async uploadBytes(
    purpose: WrAuthStoragePurpose,
    bytes: Uint8Array,
    contentType: string
  ): Promise<string> {
    const accessToken = await getAccessToken();
    const object = await wrAuthClient.createStorageObject(accessToken, {
      purpose,
      content_type: contentType,
      data_base64: bytesToBase64(bytes),
    });
    return toWrAuthStorageRef(object.id);
  },

  async downloadBytes(storageRef: string): Promise<Uint8Array> {
    const accessToken = await getAccessToken();
    const base64 = await wrAuthClient.downloadStorageObject(accessToken, storageRef);
    return base64ToBytes(base64);
  },

  async deleteRef(storageRef: string): Promise<void> {
    if (!storageRef.startsWith('wrauth-storage://')) {
      return;
    }
    const accessToken = await getAccessToken();
    try {
      await wrAuthClient.deleteStorageObject(accessToken, storageRef);
    } catch (error) {
      if (error instanceof WrAuthRequestError && error.code === 'STORAGE_NOT_FOUND') {
        return;
      }
      throw error;
    }
  },
};
