import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { getDeepLinkUrl } from '@/services/deep-link.service';
import { supabase } from '@/services/supabase.client';

export type OAuthProvider = 'google' | 'github';

type UserMetadata = Record<string, unknown>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const isValidEmail = (value: string) => emailRegex.test(value);

const isRlsError = (error: { message?: string; code?: string } | null) => {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return message.includes('row level security') || message.includes('row-level security') || error.code === '42501';
};

const buildProfilePayload = (userId: string, metadata?: UserMetadata) => {
  const payload: Record<string, string> = { id: userId };
  const displayName = metadata?.display_name;
  const avatarUrl = metadata?.avatar_url;
  if (typeof displayName === 'string' && displayName.trim()) {
    payload.display_name = displayName.trim();
  }
  if (typeof avatarUrl === 'string' && avatarUrl.trim()) {
    payload.avatar_url = avatarUrl.trim();
  }
  return payload;
};

const parseAuthCallbackUrl = (url: string) => {
  const parsed = Linking.parse(url);
  const hash = url.includes('#') ? url.split('#')[1] : '';
  const hashParams = new URLSearchParams(hash);
  const accessTokenFromHash = hashParams.get('access_token');
  const refreshTokenFromHash = hashParams.get('refresh_token');
  const accessTokenFromQuery =
    typeof parsed.queryParams?.access_token === 'string' ? parsed.queryParams.access_token : null;
  const refreshTokenFromQuery =
    typeof parsed.queryParams?.refresh_token === 'string' ? parsed.queryParams.refresh_token : null;
  const errorParam = parsed.queryParams?.error ?? hashParams.get('error');
  const errorDescriptionParam = parsed.queryParams?.error_description ?? hashParams.get('error_description');
  const errorMessage =
    typeof errorDescriptionParam === 'string'
      ? errorDescriptionParam
      : typeof errorParam === 'string'
        ? errorParam
        : null;

  return {
    accessToken: accessTokenFromHash ?? accessTokenFromQuery,
    refreshToken: refreshTokenFromHash ?? refreshTokenFromQuery,
    errorMessage,
  };
};

const signInWithPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { session: data.session ?? null, error: error?.message ?? null };
};

const signUpWithEmail = async (
  email: string,
  password: string,
  metadata: Record<string, string>
) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getDeepLinkUrl('auth-callback'),
      data: metadata,
    },
  });

  return { error: error?.message ?? null };
};

const startOAuth = async (provider: OAuthProvider) => {
  const redirectTo = getDeepLinkUrl('auth-callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  return { url: data?.url ?? null, redirectTo, error: error?.message ?? null };
};

const setSessionFromTokens = async (accessToken: string, refreshToken: string) => {
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return { session: data.session ?? null, error: error?.message ?? null };
};

const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session ?? null, error: error?.message ?? null };
};

const ensureApprovedUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, is_approved')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (data?.is_approved === false) {
    await supabase.auth.signOut();
    return { ok: false, error: 'User does not exist. Sign up to continue.' };
  }

  return { ok: true };
};

const ensureUserProfile = async (session: Session) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data) {
    const payload = buildProfilePayload(session.user.id, session.user.user_metadata as UserMetadata);
    const { error: insertError } = await supabase.from('user_profiles').insert(payload);
    if (insertError) {
      if (isRlsError(insertError)) {
        return { ok: true };
      }
      await supabase.auth.signOut();
      return { ok: false, error: insertError.message };
    }
  }

  return { ok: true };
};

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
};

const onAuthStateChange = (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) => {
  return supabase.auth.onAuthStateChange(callback);
};

export const authService = {
  normalizeEmail,
  isValidEmail,
  parseAuthCallbackUrl,
  signInWithPassword,
  signUpWithEmail,
  startOAuth,
  setSessionFromTokens,
  getSession,
  ensureApprovedUser,
  ensureUserProfile,
  signOut,
  onAuthStateChange,
};
