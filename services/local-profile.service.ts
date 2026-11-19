import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import * as Crypto from 'expo-crypto';

const PROFILE_KEY = '@fitnesstracker/local_profile_v1';
const PROFILE_DIRECTORY = 'profile';

export type LocalProfile = {
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  setup_complete: boolean;
};

export type LocalProfileUpdates = Partial<Pick<LocalProfile, 'display_name' | 'avatar_url' | 'bio'>>;

const EMPTY_PROFILE: LocalProfile = {
  display_name: '',
  avatar_url: null,
  bio: null,
  setup_complete: false,
};

const profileDirectory = () => {
  const directory = new Directory(Paths.document, PROFILE_DIRECTORY);
  if (!directory.exists) directory.create();
  return directory;
};

const copyAvatarToAppStorage = async (uri: string | null): Promise<string | null> => {
  if (!uri) return null;
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    throw new Error('Choose a photo stored on this device.');
  }

  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase();
  const safeExtension = extension && /^[a-z0-9]{2,5}$/.test(extension) ? extension : 'jpg';
  const target = new File(profileDirectory(), `avatar-${Crypto.randomUUID()}.${safeExtension}`);
  target.create({ overwrite: true });
  target.write(await new File(uri).bytes());
  return target.uri;
};

export const localProfileService = {
  async get(): Promise<LocalProfile> {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...EMPTY_PROFILE };
    try {
      return { ...EMPTY_PROFILE, ...(JSON.parse(raw) as Partial<LocalProfile>) };
    } catch {
      return { ...EMPTY_PROFILE };
    }
  },

  async save(updates: LocalProfileUpdates, completeSetup = false): Promise<LocalProfile> {
    const current = await this.get();
    let avatarUrl = current.avatar_url;
    if (updates.avatar_url !== undefined && updates.avatar_url !== current.avatar_url) {
      avatarUrl = await copyAvatarToAppStorage(updates.avatar_url);
      if (current.avatar_url?.startsWith('file://')) {
        try {
          const oldAvatar = new File(current.avatar_url);
          if (oldAvatar.exists) oldAvatar.delete();
        } catch { /* Clean up old avatar when possible. */ }
      }
    }

    const next: LocalProfile = {
      ...current,
      ...updates,
      display_name: updates.display_name?.trim() ?? current.display_name,
      avatar_url: avatarUrl,
      bio: updates.bio === undefined ? current.bio : updates.bio?.trim() || null,
      setup_complete: completeSetup || current.setup_complete,
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    return next;
  },
};
