import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { useErrorAlert } from '@/hooks/use-error-alert';
import { pendingProfileService } from '@/services/pending-profile.service';
import { WrAuthRequestError, wrAuthClient } from '@/services/wrauth.client';
import { wrauthConfigured } from '@/services/wrauth.config';

export const useSignUpForm = () => {
  const router = useRouter();
  const { applyLoginResult } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const clearError = useCallback(() => {
    setError(null);
    setErrorTitle(null);
  }, []);

  const [displayName, setDisplayName] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useErrorAlert({
    title: errorTitle ?? 'Sign up failed',
    message: error,
    onDismiss: clearError,
  });

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert({
        title: 'Permission needed',
        message: 'Photo library access is required to select a picture.',
        variant: 'warning',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  }, [showAlert]);

  const handleEmailSignUp = useCallback(async () => {
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
      const profile =
        displayName.trim() || avatarUri
          ? {
              ...(displayName.trim() ? { display_name: displayName.trim() } : {}),
              ...(avatarUri ? { avatar_url: avatarUri } : {}),
            }
          : undefined;

      const registerResult = await wrAuthClient.register(email.trim(), password, profile);

      if (profile) {
        await pendingProfileService.save(email.trim(), profile);
      }

      if (registerResult.verification_required) {
        setPassword('');
        if (registerResult.verification_email_sent === false) {
          showAlert({
            title: 'Account created',
            message:
              'Your account was created, but the verification email could not be sent. Fix SMTP in wrAuth admin, then tap Resend on the next screen.',
            variant: 'warning',
          });
        }
        router.replace({ pathname: '/signup-success', params: { email: email.trim() } });
        return;
      }

      const loginResult = await wrAuthClient.login(email.trim(), password);
      const outcome = await applyLoginResult(loginResult, profile);
      if (outcome !== 'ok') {
        setErrorTitle('Sign up complete');
        setError('Account created. Sign in to finish setup.');
        router.replace('/sign-in');
        return;
      }
      setPassword('');
      router.replace('/(tabs)');
    } catch (authError) {
      if (__DEV__) {
        console.warn('[signup] failed', authError);
      }
      setErrorTitle('Sign up failed');
      if (authError instanceof WrAuthRequestError) {
        if (authError.code === 'EMAIL_ALREADY_EXISTS') {
          setError('An account with this email already exists.');
        } else if (authError.code === 'SMTP_CONFIG_REQUIRED' || authError.code === 'SMTP_DELIVERY_FAILED') {
          setError(
            `${authError.message} Update SMTP in wrAuth admin (use a Gmail App Password and a From address your provider allows).`
          );
        } else {
          setError(authError.message);
        }
      } else if (authError instanceof Error && authError.message) {
        setError(authError.message);
      } else {
        setError('Unable to create your account. Check your network and wrAuth API URL.');
      }
    } finally {
      setLoading(false);
    }
  }, [applyLoginResult, avatarUri, displayName, email, password, router, showAlert]);

  return {
    displayName,
    avatarUri,
    email,
    password,
    loading,
    setDisplayName,
    setEmail,
    setPassword,
    handlePickAvatar,
    handleEmailSignUp,
  };
};
