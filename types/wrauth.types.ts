export type WrAuthUser = {
  id: string;
  email: string;
  email_verified: boolean;
};

export type WrAuthSessionTokens = {
  access_token: string;
  refresh_token: string;
};

export type WrAuthLoginResult =
  | WrAuthSessionTokens
  | { mfa_required: true; mfa_token: string }
  | { mfa_enrollment_required: true; enrollment_token: string };

export type WrAuthRegisterResult = {
  message: string;
  verification_required: boolean;
  verification_method: 'link' | 'otp' | null;
  verification_email_sent?: boolean;
};

export type WrAuthApiError = {
  code: string;
  message: string;
};

export type WrAuthProfile = {
  id: string;
  owner_user_id?: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type StoredAuthSession = WrAuthSessionTokens & {
  user: WrAuthUser;
  display_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
  profile_id?: string;
};
