import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useErrorAlert } from '@/hooks/use-error-alert';
import { WrAuthRequestError, wrAuthClient } from '@/services/wrauth.client';
import { wrauthConfigured } from '@/services/wrauth.config';

export const useResetPasswordForm = (token: string) => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useErrorAlert({
    title: 'Reset failed',
    message: error,
    onDismiss: () => setError(null),
  });

  const handleSubmit = useCallback(async () => {
    if (!wrauthConfigured) {
      setError('wrAuth is not configured for this build.');
      return;
    }
    if (!token) {
      setError('Reset link is missing or invalid.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await wrAuthClient.resetPassword(token, password);
      router.replace('/sign-in');
    } catch (resetError) {
      if (resetError instanceof WrAuthRequestError) {
        setError(resetError.message);
      } else {
        setError('Unable to reset your password.');
      }
    } finally {
      setLoading(false);
    }
  }, [confirmPassword, password, router, token]);

  return {
    password,
    confirmPassword,
    loading,
    setPassword,
    setConfirmPassword,
    handleSubmit,
  };
};
