import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useErrorAlert } from '@/hooks/use-error-alert';
import { WrAuthRequestError, wrAuthClient } from '@/services/wrauth.client';
import { wrauthConfigured } from '@/services/wrauth.config';

export const useForgotPasswordForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useErrorAlert({
    title: 'Could not send reset email',
    message: error,
    onDismiss: () => setError(null),
  });

  const handleSubmit = useCallback(async () => {
    if (!wrauthConfigured) {
      setError('wrAuth is not configured for this build.');
      return;
    }
    if (!email.trim()) {
      setError('Enter the email for your account.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await wrAuthClient.requestPasswordReset(email.trim());
      setSent(true);
    } catch (requestError) {
      if (requestError instanceof WrAuthRequestError) {
        setError(requestError.message);
      } else {
        setError('Unable to request a password reset.');
      }
    } finally {
      setLoading(false);
    }
  }, [email]);

  const goBack = useCallback(() => {
    router.replace('/sign-in');
  }, [router]);

  return {
    email,
    loading,
    sent,
    setEmail,
    handleSubmit,
    goBack,
  };
};
