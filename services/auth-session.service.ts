import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import type { StoredAuthSession } from '@/types/wrauth.types';

const SESSION_KEY = '@fitnesstracker/wrauth_session_profile';
const LEGACY_SESSION_KEY = '@fitnesstracker/wrauth_session';
const REFRESH_TOKEN_KEY = 'fitnesstracker_refresh_token';

type SessionProfile = Omit<StoredAuthSession, 'refresh_token'>;

type Listener = () => void;
const listeners = new Set<Listener>();

let memorySession: StoredAuthSession | null = null;

const notify = () => {
  listeners.forEach(listener => listener());
};

const readRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

const writeRefreshToken = async (token: string | null): Promise<void> => {
  try {
    if (!token) {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      return;
    }
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch {
    // SecureStore can fail on simulators without entitlements.
  }
};

const readProfile = async (): Promise<SessionProfile | null> => {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as SessionProfile;
  } catch {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
};

const writeProfile = async (profile: SessionProfile | null): Promise<void> => {
  if (!profile) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return;
  }
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(profile));
};

const migrateLegacySession = async (): Promise<StoredAuthSession | null> => {
  const raw = await AsyncStorage.getItem(LEGACY_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    const legacy = JSON.parse(raw) as StoredAuthSession;
    if (!legacy?.refresh_token || !legacy.access_token || !legacy.user) {
      await AsyncStorage.removeItem(LEGACY_SESSION_KEY);
      return null;
    }
    await authSessionService.setSession(legacy);
    await AsyncStorage.removeItem(LEGACY_SESSION_KEY);
    return legacy;
  } catch {
    await AsyncStorage.removeItem(LEGACY_SESSION_KEY);
    return null;
  }
};

const mergeSession = async (): Promise<StoredAuthSession | null> => {
  const [refresh_token, profile] = await Promise.all([readRefreshToken(), readProfile()]);
  if (!refresh_token || !profile?.access_token || !profile.user) {
    return migrateLegacySession();
  }
  return { ...profile, refresh_token };
};

export const authSessionService = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  async getSession(): Promise<StoredAuthSession | null> {
    if (memorySession) {
      return memorySession;
    }
    memorySession = await mergeSession();
    return memorySession;
  },

  async setSession(session: StoredAuthSession | null): Promise<void> {
    memorySession = session;
    if (!session) {
      await Promise.all([writeRefreshToken(null), writeProfile(null)]);
      notify();
      return;
    }
    const { refresh_token, ...profile } = session;
    await Promise.all([writeRefreshToken(refresh_token), writeProfile(profile)]);
    notify();
  },

  async getAccessToken(): Promise<string | null> {
    const session = await this.getSession();
    return session?.access_token ?? null;
  },

  async updateUserProfile(updates: {
    display_name?: string;
    avatar_url?: string | null;
    bio?: string | null;
    profile_id?: string;
    user?: StoredAuthSession['user'];
  }): Promise<void> {
    const session = await this.getSession();
    if (!session) {
      return;
    }
    const next: StoredAuthSession = {
      ...session,
      ...(updates.user ? { user: updates.user } : {}),
      ...(updates.display_name !== undefined ? { display_name: updates.display_name } : {}),
      ...(updates.avatar_url !== undefined ? { avatar_url: updates.avatar_url } : {}),
      ...(updates.bio !== undefined ? { bio: updates.bio } : {}),
      ...(updates.profile_id !== undefined ? { profile_id: updates.profile_id } : {}),
    };
    await this.setSession(next);
  },
};
