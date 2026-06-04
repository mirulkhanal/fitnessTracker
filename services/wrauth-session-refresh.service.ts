import { authSessionService } from '@/services/auth-session.service';
import { biometricAuthService } from '@/services/biometric-auth.service';
import { WrAuthRequestError, wrAuthClient } from '@/services/wrauth.client';
import type { StoredAuthSession } from '@/types/wrauth.types';
import { isWrAuthSessionInvalidError } from '@/utils/wrauth-auth-errors';

let refreshInFlight: Promise<StoredAuthSession | null> | null = null;

const syncBiometricRefreshToken = async (session: StoredAuthSession) => {
  if (!(await biometricAuthService.isEnabled())) {
    return;
  }
  try {
    await biometricAuthService.updateRefreshToken(session.refresh_token, session.user.email);
  } catch {
    // Biometric re-enrollment may be required on some devices.
  }
};

export const refreshStoredSession = async (
  profile?: Pick<StoredAuthSession, 'display_name' | 'avatar_url' | 'bio' | 'profile_id'>
): Promise<StoredAuthSession | null> => {
  const stored = await authSessionService.getSession();
  if (!stored?.refresh_token) {
    return null;
  }

  const tokens = await wrAuthClient.refresh(stored.refresh_token);
  const user = await wrAuthClient.me(tokens.access_token);
  const next: StoredAuthSession = {
    ...tokens,
    user,
    display_name: profile?.display_name ?? stored.display_name,
    avatar_url: profile?.avatar_url !== undefined ? profile.avatar_url : stored.avatar_url,
    bio: profile?.bio !== undefined ? profile.bio : stored.bio,
    profile_id: profile?.profile_id ?? stored.profile_id,
  };
  await authSessionService.setSession(next);
  await syncBiometricRefreshToken(next);
  return next;
};

export const refreshStoredSessionOnce = async (
  profile?: Pick<StoredAuthSession, 'display_name' | 'avatar_url' | 'bio' | 'profile_id'>
): Promise<StoredAuthSession | null> => {
  if (!refreshInFlight) {
    refreshInFlight = refreshStoredSession(profile).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
};

export const executeWithAccessTokenRetry = async <T>(
  operation: (accessToken: string) => Promise<T>
): Promise<T> => {
  const session = await authSessionService.getSession();
  if (!session?.access_token) {
    throw new Error('Sign in required');
  }

  try {
    return await operation(session.access_token);
  } catch (error) {
    if (!(error instanceof WrAuthRequestError) || error.status !== 401) {
      throw error;
    }
    const refreshed = await refreshStoredSessionOnce();
    if (!refreshed?.access_token) {
      throw error;
    }
    return await operation(refreshed.access_token);
  }
};

export const clearSessionIfInvalid = async (error: unknown): Promise<boolean> => {
  if (!isWrAuthSessionInvalidError(error)) {
    return false;
  }
  await authSessionService.setSession(null);
  return true;
};
