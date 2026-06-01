import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StoredAuthSession } from '@/types/wrauth.types';

const STORAGE_KEY = '@fitnesstracker/wrauth_session';

type Listener = () => void;
const listeners = new Set<Listener>();

let memorySession: StoredAuthSession | null = null;

const notify = () => {
  listeners.forEach(listener => listener());
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
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      memorySession = JSON.parse(raw) as StoredAuthSession;
      return memorySession;
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  async setSession(session: StoredAuthSession | null): Promise<void> {
    memorySession = session;
    if (!session) {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
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
