import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

import { authSessionService } from '@/services/auth-session.service';
import { biometricAuthService } from '@/services/biometric-auth.service';
import { executeWithAccessTokenRetry } from '@/services/wrauth-session-refresh.service';
import { wrAuthClient } from '@/services/wrauth.client';
import { wrAuthDataService } from '@/services/wrauth-data.service';
import { wrAuthStorageService } from '@/services/wrauth-storage.service';
import { isWrAuthStorageRef } from '@/constants/wrauth-storage';

const VAULT_REF_STORAGE_KEY = '@fitnesstracker/photo_vault_storage_ref';

const deleteLocalVault = async () => {
  const encryptedDir = new Directory(Paths.document, 'encrypted-photos');
  const previewDir = new Directory(Paths.cache, 'photo-previews');
  const keyFile = new File(Paths.document, 'photo-key.bin');

  for (const dir of [encryptedDir, previewDir]) {
    try {
      if (dir.exists) {
        dir.delete();
      }
    } catch {
      // Best effort.
    }
  }
  try {
    if (keyFile.exists) {
      keyFile.delete();
    }
  } catch {
    // Best effort.
  }
  await AsyncStorage.multiRemove([VAULT_REF_STORAGE_KEY]);
};

export const accountDeletionService = {
  async deleteAccountAndLocalData(): Promise<void> {
    const session = await authSessionService.getSession();
    if (!session?.access_token) {
      throw new Error('Sign in to delete your account.');
    }

    await executeWithAccessTokenRetry(async accessToken => {
      const photos = await wrAuthDataService.listPhotoMetadata();
      for (const photo of photos) {
        if (photo.local_id && isWrAuthStorageRef(photo.local_id)) {
          await wrAuthStorageService.deleteRef(photo.local_id).catch(() => undefined);
        }
        await wrAuthClient.deleteDataRow('photo_metadata', accessToken, photo.id);
      }

      const categories = await wrAuthDataService.listCategories();
      for (const category of categories) {
        await wrAuthClient.deleteDataRow('categories', accessToken, category.id);
      }

      const profileId = session.profile_id;
      if (profileId) {
        await wrAuthClient.deleteDataRow('profiles', accessToken, profileId).catch(() => undefined);
      }

      if (session.avatar_url && isWrAuthStorageRef(session.avatar_url)) {
        await wrAuthStorageService.deleteRef(session.avatar_url).catch(() => undefined);
      }

      const vaultRef = await AsyncStorage.getItem(VAULT_REF_STORAGE_KEY);
      if (vaultRef && isWrAuthStorageRef(vaultRef)) {
        await wrAuthStorageService.deleteRef(vaultRef).catch(() => undefined);
      }
    });

    if (session.refresh_token) {
      await wrAuthClient.logout(session.refresh_token).catch(() => undefined);
    }

    await deleteLocalVault();
    await biometricAuthService.disable();
    await authSessionService.setSession(null);
  },
};
