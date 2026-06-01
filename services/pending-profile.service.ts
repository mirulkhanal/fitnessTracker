import AsyncStorage from '@react-native-async-storage/async-storage';

export type PendingProfile = {
  display_name?: string;
  avatar_url?: string | null;
};

const storageKey = (email: string) =>
  `@fitnesstracker/pending_profile/${email.trim().toLowerCase()}`;

export const pendingProfileService = {
  async save(email: string, profile: PendingProfile): Promise<void> {
    if (!email.trim()) {
      return;
    }
    const payload: PendingProfile = {};
    if (profile.display_name?.trim()) {
      payload.display_name = profile.display_name.trim();
    }
    if (profile.avatar_url) {
      payload.avatar_url = profile.avatar_url;
    }
    if (Object.keys(payload).length === 0) {
      return;
    }
    await AsyncStorage.setItem(storageKey(email), JSON.stringify(payload));
  },

  async consume(email: string): Promise<PendingProfile | null> {
    if (!email.trim()) {
      return null;
    }
    const key = storageKey(email);
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return null;
    }
    await AsyncStorage.removeItem(key);
    try {
      return JSON.parse(raw) as PendingProfile;
    } catch {
      return null;
    }
  },
};
