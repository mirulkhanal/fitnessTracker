import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { File } from 'expo-file-system';

import { localProfileService } from '@/services/local-profile.service';

const LEGACY_PROFILE_KEY = '@fitnesstracker/wrauth_session_profile';
const LEGACY_STORAGE_KEYS = new Set([
  LEGACY_PROFILE_KEY,
  '@fitnesstracker/wrauth_session',
  '@fitnesstracker/biometric_login_enabled',
  '@fitnesstracker/biometric_login_email',
  '@fitnesstracker/photo_vault_storage_ref',
]);
const LEGACY_SECURE_KEYS = [
  'fitnesstracker_refresh_token',
  'fitnesstracker_biometric_credentials',
];

const migrateLocalProfileFields = async (): Promise<void> => {
  const current = await localProfileService.get();
  if (current.setup_complete || current.display_name.trim()) return;

  const raw = await AsyncStorage.getItem(LEGACY_PROFILE_KEY);
  if (!raw) return;
  try {
    const legacy = JSON.parse(raw) as {
      display_name?: unknown;
      avatar_url?: unknown;
      bio?: unknown;
    };
    const displayName = typeof legacy.display_name === 'string' ? legacy.display_name.trim() : '';
    const bio = typeof legacy.bio === 'string' ? legacy.bio : null;
    const avatarUri = typeof legacy.avatar_url === 'string' && legacy.avatar_url.startsWith('file://')
      ? legacy.avatar_url
      : null;
    if (displayName || bio || avatarUri) {
      const avatarExists = avatarUri ? new File(avatarUri).exists : false;
      await localProfileService.save({
        ...(displayName ? { display_name: displayName } : {}),
        ...(bio ? { bio } : {}),
        ...(avatarExists ? { avatar_url: avatarUri } : {}),
      });
    }
  } catch (error) {
    if (__DEV__) console.warn('[local migration] Could not reuse the previous local profile.', error);
  }
};

export const localDataMigrationService = {
  async removeLegacyAccountState(): Promise<void> {
    await migrateLocalProfileFields();
    const keys = await AsyncStorage.getAllKeys();
    const obsoleteKeys = keys.filter(key =>
      LEGACY_STORAGE_KEYS.has(key) ||
      key.startsWith('@fitnesstracker/pending_profile/') ||
      key.startsWith('@fitnesstracker/wrauth_data_migrated/') ||
      key.startsWith('@fitnesstracker/supabase_data_migrated/') ||
      /^sb-.+-auth-token$/.test(key)
    );
    if (obsoleteKeys.length) await AsyncStorage.multiRemove(obsoleteKeys);
    await Promise.all(LEGACY_SECURE_KEYS.map(key => SecureStore.deleteItemAsync(key).catch(() => undefined)));
  },
};
