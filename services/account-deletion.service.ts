import { Directory, File, Paths } from 'expo-file-system';

import { authSessionService } from '@/services/auth-session.service';
import { biometricAuthService } from '@/services/biometric-auth.service';
import { photoVaultService } from '@/services/photo-vault.service';
import { photosService } from '@/services/photos.service';
import { executeWithAccessTokenRetry } from '@/services/wrauth-session-refresh.service';
import { wrAuthClient } from '@/services/wrauth.client';

/** Remove legacy on-disk photo files from older app versions. */
const deleteLegacyLocalPhotoFiles = async () => {
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
};

export const accountDeletionService = {
  async deleteAccountAndLocalData(password: string): Promise<void> {
    const session = await authSessionService.getSession();
    if (!session?.access_token) {
      throw new Error('Sign in to delete your account.');
    }

    await executeWithAccessTokenRetry(accessToken =>
      wrAuthClient.deleteAccount(accessToken, password)
    );

    photosService.clearSessionCache();
    photoVaultService.clear();
    await photoVaultService.clearStoredVaultRef();
    await deleteLegacyLocalPhotoFiles();
    await biometricAuthService.disable();
    await authSessionService.setSession(null);
  },
};
