import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useAppLock } from '@/contexts/AppLockContext';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorAlert } from '@/hooks/use-error-alert';
import { biometricAuthService } from '@/services/biometric-auth.service';
import { WrAuthRequestError, wrAuthClient } from '@/services/wrauth.client';
import { wrauthConfigured } from '@/services/wrauth.config';

export const useSignInForm = () => {
  const router = useRouter();
  const { applyLoginResult, isAuthenticated, refreshSession, session } = useAuth();
  const { isLocked, releaseLock } = useAppLock();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometrics');
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadBiometricState = async () => {
      if (!biometricAuthService.isSupportedPlatform()) {
        return;
      }
      const [enabled, label, storedEmail] = await Promise.all([
        biometricAuthService.isEnabled(),
        biometricAuthService.getLoginLabel(),
        biometricAuthService.getStoredEmail(),
      ]);
      if (!active) {
        return;
      }
      setBiometricEnabled(enabled);
      setBiometricLabel(label);
      if (enabled && storedEmail) {
        setEmail(storedEmail);
      }
    };

    void loadBiometricState();
    return () => {
      active = false;
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setErrorTitle(null);
  }, []);

  useErrorAlert({
    title: errorTitle ?? 'Sign in failed',
    message: error,
    onDismiss: clearError,
  });

  const handleEmailSignIn = useCallback(async () => {
    if (!wrauthConfigured) {
      setErrorTitle('Auth not configured');
      setError('Set EXPO_PUBLIC_WRAUTH_API_URL and EXPO_PUBLIC_WRAUTH_APP_KEY in your environment.');
      return;
    }
    if (!email || !password) {
      setErrorTitle('Missing details');
      setError('Enter your email and password to continue.');
      return;
    }
    setLoading(true);
    setError(null);
    setErrorTitle(null);
    try {
      const result = await wrAuthClient.login(email.trim(), password);
      const outcome = await applyLoginResult(result);
      if (outcome === 'mfa_required') {
        setErrorTitle('Two-factor required');
        setError('This account has 2FA enabled. Complete sign-in in the wrAuth admin client for now.');
        return;
      }
      if (outcome === 'mfa_enrollment_required') {
        setErrorTitle('2FA setup required');
        setError('This app requires two-factor setup before you can sign in.');
        return;
      }
      setPassword('');
      releaseLock();
      router.replace('/(tabs)');
    } catch (authError) {
      setErrorTitle('Sign in failed');
      if (authError instanceof WrAuthRequestError) {
        if (authError.code === 'EMAIL_NOT_VERIFIED') {
          setError('Verify your email, then try again.');
        } else {
          setError(authError.message);
        }
      } else {
        setError('Unable to sign in.');
      }
    } finally {
      setLoading(false);
    }
  }, [applyLoginResult, email, password, releaseLock, router]);

  const handleBiometricSignIn = useCallback(async () => {
    if (!wrauthConfigured) {
      setErrorTitle('Auth not configured');
      setError('Set EXPO_PUBLIC_WRAUTH_API_URL and EXPO_PUBLIC_WRAUTH_APP_KEY in your environment.');
      return;
    }

    setBiometricLoading(true);
    setError(null);
    setErrorTitle(null);
    try {
      await biometricAuthService.authenticateUser('Unlock FitTrack Progress');

      if (isLocked && isAuthenticated && session?.refresh_token) {
        try {
          await refreshSession();
        } catch {
          // Offline or expired refresh — still allow unlock if session exists locally.
        }
        releaseLock();
        router.replace('/(tabs)');
        return;
      }

      const credentials = await biometricAuthService.getStoredCredentials();
      const tokens = await wrAuthClient.refresh(credentials.refresh_token);
      const outcome = await applyLoginResult(tokens);
      if (outcome === 'mfa_required') {
        setErrorTitle('Two-factor required');
        setError('This account has 2FA enabled. Sign in with your password instead.');
        return;
      }
      if (outcome === 'mfa_enrollment_required') {
        setErrorTitle('2FA setup required');
        setError('Sign in with your password to complete two-factor setup.');
        return;
      }
      setEmail(credentials.email);
      releaseLock();
      router.replace('/(tabs)');
    } catch (authError) {
      setErrorTitle('Biometric sign-in failed');
      if (authError instanceof WrAuthRequestError) {
        if (authError.status === 401) {
          await biometricAuthService.disable();
          setBiometricEnabled(false);
          setError('Your saved sign-in expired. Sign in with your password and enable biometrics again.');
        } else {
          setError(authError.message);
        }
      } else if (authError instanceof Error) {
        setError(authError.message);
      } else {
        setError('Unable to sign in with biometrics.');
      }
    } finally {
      setBiometricLoading(false);
    }
  }, [
    applyLoginResult,
    isAuthenticated,
    isLocked,
    refreshSession,
    releaseLock,
    router,
    session?.refresh_token,
  ]);

  return {
    email,
    password,
    loading: loading || biometricLoading,
    biometricEnabled,
    biometricLabel,
    setEmail,
    setPassword,
    handleEmailSignIn,
    handleBiometricSignIn,
  };
};
