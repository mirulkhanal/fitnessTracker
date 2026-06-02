import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { avatarUploadService } from '@/services/avatar-upload.service';
import { authSessionService } from '@/services/auth-session.service';
import { dataMigrationService } from '@/services/data-migration.service';
import { pendingProfileService } from '@/services/pending-profile.service';
import { WrAuthRequestError, wrAuthClient } from '@/services/wrauth.client';
import type { StoredAuthSession, WrAuthLoginResult } from '@/types/wrauth.types';

type ProfileFields = {
  display_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
};

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  session: StoredAuthSession | null;
  refreshSession: () => Promise<void>;
  syncProfileToRemote: () => Promise<void>;
  updateProfile: (updates: ProfileFields) => Promise<void>;
  applyLoginResult: (
    result: WrAuthLoginResult,
    profile?: ProfileFields
  ) => Promise<'ok' | 'mfa_required' | 'mfa_enrollment_required'>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const persistSession = async (
  tokens: { access_token: string; refresh_token: string },
  profile?: ProfileFields
) => {
  const user = await wrAuthClient.me(tokens.access_token);
  const pendingProfile = await pendingProfileService.consume(user.email);
  const profilePayload = {
    ...(pendingProfile ?? {}),
    ...(profile ?? {}),
  };
  if (profilePayload.avatar_url) {
    profilePayload.avatar_url = await avatarUploadService.resolveAvatarForProfile(
      profilePayload.avatar_url
    );
  }

  let remoteProfile = null;
  try {
    remoteProfile = await wrAuthClient.upsertProfile(tokens.access_token, profilePayload);
    if (!remoteProfile && Object.keys(profilePayload).length > 0) {
      console.warn(
        '[wrAuth] Profile was not saved. Create a "profiles" table in wrAuth admin (Data Tables) with display_name and avatar_url columns.'
      );
    }
    if (!remoteProfile) {
      remoteProfile = await wrAuthClient.getProfile(tokens.access_token);
    }
  } catch (profileError) {
    console.warn('Profile sync failed; continuing without remote profile row.', profileError);
    if (__DEV__ && profileError instanceof WrAuthRequestError) {
      console.warn('[wrAuth]', profileError.code, profileError.message);
    }
  }
  const session: StoredAuthSession = {
    ...tokens,
    user,
    ...(remoteProfile?.display_name
      ? { display_name: remoteProfile.display_name }
      : profile?.display_name
        ? { display_name: profile.display_name }
        : {}),
    ...(remoteProfile?.avatar_url !== undefined
      ? { avatar_url: remoteProfile.avatar_url ?? null }
      : profile?.avatar_url !== undefined
        ? { avatar_url: profile.avatar_url ?? null }
        : {}),
    ...(remoteProfile?.bio !== undefined
      ? { bio: remoteProfile.bio ?? null }
      : profile?.bio !== undefined
        ? { bio: profile.bio ?? null }
        : {}),
    ...(remoteProfile?.id ? { profile_id: remoteProfile.id } : {}),
  };
  await authSessionService.setSession(session);
  void dataMigrationService.migrateLocalDataToWrAuthIfNeeded().catch(error => {
    if (__DEV__) {
      console.warn('[wrAuth] Local data migration failed:', error);
    }
  });
  return session;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<StoredAuthSession | null>(null);

  const syncFromStorage = useCallback(async () => {
    const stored = await authSessionService.getSession();
    setSession(stored);
    return stored;
  }, []);

  const refreshSession = useCallback(async () => {
    const stored = await authSessionService.getSession();
    if (!stored?.refresh_token) {
      setSession(null);
      return;
    }
    try {
      const tokens = await wrAuthClient.refresh(stored.refresh_token);
      const next = await persistSession(tokens, {
        display_name: stored.display_name,
        avatar_url: stored.avatar_url,
        bio: stored.bio,
      });
      setSession(next);
    } catch (error) {
      if (error instanceof WrAuthRequestError) {
        await authSessionService.setSession(null);
        setSession(null);
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const stored = await syncFromStorage();
        if (!stored?.refresh_token) {
          return;
        }
        await refreshSession();
      } catch {
        if (active) {
          setSession(await authSessionService.getSession());
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();
    const unsubscribe = authSessionService.subscribe(() => {
      void syncFromStorage().then(next => {
        if (active) {
          setSession(next);
        }
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [refreshSession, syncFromStorage]);

  const applyLoginResult = useCallback(
    async (
      result: WrAuthLoginResult,
      profile?: { display_name?: string; avatar_url?: string | null; bio?: string | null }
    ): Promise<'ok' | 'mfa_required' | 'mfa_enrollment_required'> => {
      if (wrAuthClient.isSessionTokens(result)) {
        const next = await persistSession(result, profile);
        setSession(next);
        return 'ok';
      }
      if ('mfa_required' in result && result.mfa_required) {
        return 'mfa_required';
      }
      return 'mfa_enrollment_required';
    },
    []
  );

  const syncProfileToRemote = useCallback(async () => {
    if (!session?.access_token) {
      return;
    }
    const next = await persistSession(
      {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      },
      {
        display_name: session.display_name,
        avatar_url: session.avatar_url,
        bio: session.bio,
      }
    );
    setSession(next);
  }, [session]);

  const updateProfile = useCallback(
    async (updates: ProfileFields) => {
      if (!session?.access_token) {
        throw new Error('Sign in to update your profile.');
      }
      const remote = await wrAuthClient.upsertProfile(session.access_token, updates);
      const next: StoredAuthSession = {
        ...session,
        ...(updates.display_name !== undefined
          ? { display_name: updates.display_name }
          : remote?.display_name
            ? { display_name: remote.display_name }
            : {}),
        ...(updates.avatar_url !== undefined
          ? { avatar_url: updates.avatar_url }
          : remote?.avatar_url !== undefined
            ? { avatar_url: remote.avatar_url ?? null }
            : {}),
        ...(updates.bio !== undefined
          ? { bio: updates.bio ?? null }
          : remote?.bio !== undefined
            ? { bio: remote.bio ?? null }
            : {}),
        ...(remote?.id ? { profile_id: remote.id } : {}),
      };
      await authSessionService.setSession(next);
      setSession(next);
    },
    [session]
  );

  const profileSyncAttemptedRef = useRef(false);
  useEffect(() => {
    if (profileSyncAttemptedRef.current) {
      return;
    }
    if (!session?.access_token || session.profile_id) {
      return;
    }
    if (!session.display_name && session.avatar_url == null && session.bio == null) {
      return;
    }
    profileSyncAttemptedRef.current = true;
    void syncProfileToRemote();
  }, [session, syncProfileToRemote]);

  const signOut = useCallback(async () => {
    const stored = await authSessionService.getSession();
    if (stored?.refresh_token) {
      try {
        await wrAuthClient.logout(stored.refresh_token);
      } catch {
        // Clear local session even if revoke fails (offline / expired token).
      }
    }
    await authSessionService.setSession(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isAuthenticated: Boolean(session?.access_token),
      session,
      refreshSession,
      syncProfileToRemote,
      updateProfile,
      applyLoginResult,
      signOut,
    }),
    [
      applyLoginResult,
      isLoading,
      refreshSession,
      session,
      signOut,
      syncProfileToRemote,
      updateProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
