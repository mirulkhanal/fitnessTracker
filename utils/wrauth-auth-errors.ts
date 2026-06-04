import { WrAuthRequestError } from '@/services/wrauth.client';

/** True when the refresh token is invalid or revoked — safe to clear the local session. */
export const isWrAuthSessionInvalidError = (error: unknown): boolean => {
  if (!(error instanceof WrAuthRequestError)) {
    return false;
  }
  if (error.code === 'NETWORK_ERROR' || error.code === 'WRAUTH_NOT_CONFIGURED') {
    return false;
  }
  if (error.status === 401 || error.status === 403) {
    return true;
  }
  const code = error.code.toUpperCase();
  return (
    code.includes('INVALID') ||
    code.includes('EXPIRED') ||
    code.includes('REVOKED') ||
    code === 'UNAUTHORIZED'
  );
};
