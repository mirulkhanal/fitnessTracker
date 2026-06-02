import { File, readAsStringAsync } from 'expo-file-system';

import { isWrAuthStorageRef } from '@/constants/wrauth-storage';
import { wrAuthStorageService } from '@/services/wrauth-storage.service';
import { base64ToBytes } from '@/utils/bytes-base64';

const guessContentType = (uri: string): string => {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  return 'image/jpeg';
};

const readImageBytes = async (uri: string): Promise<Uint8Array> => {
  if (uri.startsWith('file://')) {
    return await new File(uri).bytes();
  }
  const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
  return base64ToBytes(base64);
};

export const avatarUploadService = {
  async resolveAvatarForProfile(avatarUri: string | null): Promise<string | null> {
    if (!avatarUri) {
      return null;
    }
    if (
      isWrAuthStorageRef(avatarUri) ||
      avatarUri.startsWith('http://') ||
      avatarUri.startsWith('https://')
    ) {
      return avatarUri;
    }
    if (!avatarUri.startsWith('file://') && !avatarUri.startsWith('content://')) {
      return avatarUri;
    }
    const bytes = await readImageBytes(avatarUri);
    return await wrAuthStorageService.uploadBytes('avatar', bytes, guessContentType(avatarUri));
  },
};
