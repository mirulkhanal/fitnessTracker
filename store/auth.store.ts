import type { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { create } from 'zustand';

import { authService, type OAuthProvider } from '@/services/auth.service';
import { LoadingState } from '@/types/common.types';

interface AuthStore extends LoadingState {
  session: Session | null;
  errorTitle: string | null;
  sessionReady: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null, title?: string | null) => void;
  clearError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (params: {
    email: string;
    password: string;
    displayName: string;
    avatarUri: string | null;
  }) => Promise<boolean>;
  startOAuth: (provider: OAuthProvider) => Promise<boolean>;
  processAuthCallbackUrl: (url?: string | null) => Promise<{ handled: boolean; ok: boolean }>;
  handleSessionChange: (session: Session | null) => Promise<void>;
  loadSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<boolean>;
}

type AuthStoreSetter = (state: Partial<AuthStore>) => void;

const resolveErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const AUTH_TIMEOUT_MS = 10000;

const withTimeout = async <T>(promise: Promise<T>, ms: number, message: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });

const buildMetadata = (displayName: string, avatarUri: string | null) => {
  const metadata: Record<string, string> = {};
  const trimmedName = displayName.trim();
  if (trimmedName) {
    metadata.display_name = trimmedName;
  }
  if (avatarUri) {
    metadata.avatar_url = avatarUri;
  }
  return metadata;
};

const applyValidatedSession = async (
  session: Session | null,
  set: AuthStoreSetter,
  errorTitle: string
) => {
  if (!session) {
    set({ session: null });
    return false;
  }

  const approved = await withTimeout(
    authService.ensureApprovedUser(session.user.id),
    AUTH_TIMEOUT_MS,
    'Auth request timed out'
  );
  if (!approved.ok) {
    set({ session: null, error: approved.error ?? 'Auth error', errorTitle });
    return false;
  }

  const profileReady = await withTimeout(
    authService.ensureUserProfile(session),
    AUTH_TIMEOUT_MS,
    'Auth request timed out'
  );
  if (!profileReady.ok) {
    set({ session: null, error: profileReady.error ?? 'Auth error', errorTitle });
    return false;
  }

  set({ session, error: null, errorTitle: null });
  return true;
};

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  loading: false,
  error: null,
  errorTitle: null,
  sessionReady: false,
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setError: (error, title = null) => set({ error, errorTitle: title }),
  clearError: () => set({ error: null, errorTitle: null }),
  signInWithEmail: async (email, password) => {
    const normalizedEmail = authService.normalizeEmail(email);
    if (!normalizedEmail || !password) {
      set({
        error: 'Enter your email and password to continue.',
        errorTitle: 'Missing details',
      });
      return false;
    }
    if (!authService.isValidEmail(normalizedEmail)) {
      set({
        error: 'Enter a valid email address to continue.',
        errorTitle: 'Invalid email',
      });
      return false;
    }

    set({ loading: true, error: null, errorTitle: null });
    try {
      const { session, error } = await authService.signInWithPassword(normalizedEmail, password);
      if (error) {
        set({ error, errorTitle: 'Sign in failed' });
        return false;
      }

      const validated = await applyValidatedSession(session, set, 'Sign in failed');
      return validated;
    } catch (error) {
      set({ error: resolveErrorMessage(error, 'Sign in failed'), errorTitle: 'Sign in failed' });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  signUpWithEmail: async ({ email, password, displayName, avatarUri }) => {
    const normalizedEmail = authService.normalizeEmail(email);
    if (!normalizedEmail || !password) {
      set({
        error: 'Enter your email and password to continue.',
        errorTitle: 'Missing details',
      });
      return false;
    }
    if (!authService.isValidEmail(normalizedEmail)) {
      set({
        error: 'Enter a valid email address to continue.',
        errorTitle: 'Invalid email',
      });
      return false;
    }

    set({ loading: true, error: null, errorTitle: null });
    try {
      const metadata = buildMetadata(displayName, avatarUri);
      const { error } = await authService.signUpWithEmail(normalizedEmail, password, metadata);
      if (error) {
        set({ error, errorTitle: 'Sign up failed' });
        return false;
      }
      return true;
    } catch (error) {
      set({ error: resolveErrorMessage(error, 'Sign up failed'), errorTitle: 'Sign up failed' });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  startOAuth: async (provider) => {
    set({ loading: true, error: null, errorTitle: null });
    try {
      await WebBrowser.warmUpAsync();
      const { url, redirectTo, error } = await authService.startOAuth(provider);
      if (error || !url) {
        set({ error: error ?? 'No auth URL returned', errorTitle: 'OAuth failed' });
        return false;
      }

      const result = await WebBrowser.openAuthSessionAsync(url, redirectTo);
      if (result.type === 'success') {
        return true;
      }

      return false;
    } catch (error) {
      set({ error: resolveErrorMessage(error, 'OAuth failed'), errorTitle: 'OAuth failed' });
      return false;
    } finally {
      set({ loading: false });
      WebBrowser.coolDownAsync();
    }
  },
  processAuthCallbackUrl: async (url) => {
    set({ loading: true, error: null, errorTitle: null });
    try {
      if (url) {
        const parsed = authService.parseAuthCallbackUrl(url);
        if (parsed.errorMessage) {
          set({ error: parsed.errorMessage, errorTitle: 'Auth error' });
          return { handled: true, ok: false };
        }
        if (parsed.accessToken && parsed.refreshToken) {
          const { session, error } = await withTimeout(
            authService.setSessionFromTokens(parsed.accessToken, parsed.refreshToken),
            AUTH_TIMEOUT_MS,
            'Auth request timed out'
          );
          if (error) {
            set({ error, errorTitle: 'Auth error' });
            return { handled: true, ok: false };
          }
          const validated = await applyValidatedSession(session, set, 'Auth error');
          return { handled: true, ok: validated };
        }
      }

      const { session, error } = await withTimeout(
        authService.getSession(),
        AUTH_TIMEOUT_MS,
        'Auth request timed out'
      );
      if (error) {
        set({ error, errorTitle: 'Auth error' });
        return { handled: true, ok: false };
      }

      if (!session) {
        set({ error: 'Missing auth callback', errorTitle: 'Auth error' });
        return { handled: true, ok: false };
      }

      const validated = await applyValidatedSession(session, set, 'Auth error');
      return { handled: true, ok: validated };
    } catch (error) {
      set({ error: resolveErrorMessage(error, 'Failed to complete sign in'), errorTitle: 'Auth error' });
      return { handled: true, ok: false };
    } finally {
      set({ loading: false, sessionReady: true });
    }
  },
  handleSessionChange: async (session) => {
    set({ loading: true, error: null, errorTitle: null });
    try {
      await applyValidatedSession(session, set, 'Auth error');
    } catch (error) {
      set({ error: resolveErrorMessage(error, 'Failed to load session'), errorTitle: 'Auth error' });
      set({ session: null });
    } finally {
      set({ loading: false, sessionReady: true });
    }
  },
  loadSession: async () => {
    set({ loading: true, error: null, errorTitle: null });
    try {
      const { session, error } = await withTimeout(
        authService.getSession(),
        AUTH_TIMEOUT_MS,
        'Auth request timed out'
      );
      if (error) {
        set({ error, errorTitle: 'Auth error' });
        set({ session: null });
        return;
      }
      await applyValidatedSession(session, set, 'Auth error');
    } catch (error) {
      set({ error: resolveErrorMessage(error, 'Failed to load session'), errorTitle: 'Auth error' });
      set({ session: null });
    } finally {
      set({ loading: false, sessionReady: true });
    }
  },
  refreshSession: async () => {
    try {
      const { session, error } = await authService.getSession();
      if (error) {
        set({ error, errorTitle: 'Auth error' });
        return;
      }
      await applyValidatedSession(session, set, 'Auth error');
    } catch (error) {
      set({ error: resolveErrorMessage(error, 'Failed to refresh session'), errorTitle: 'Auth error' });
    }
  },
  signOut: async () => {
    set({ loading: true, error: null, errorTitle: null });
    try {
      const { error } = await authService.signOut();
      if (error) {
        set({ error, errorTitle: 'Sign out failed' });
        return false;
      }
      set({ session: null });
      return true;
    } catch (error) {
      set({ error: resolveErrorMessage(error, 'Sign out failed'), errorTitle: 'Sign out failed' });
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));
