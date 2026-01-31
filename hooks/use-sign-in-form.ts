import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useErrorAlert } from '@/hooks/use-error-alert';
import { supabase } from '@/services/supabase.client';

export const useSignInForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);

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
    if (!email || !password) {
      setErrorTitle('Missing details');
      setError('Enter your email and password to continue.');
      return;
    }
    setLoading(true);
    setError(null);
    setErrorTitle(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError || !data.session) {
        setErrorTitle('Sign in failed');
        setError(authError?.message ?? 'Unable to sign in.');
        return;
      }
      setPassword('');
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  const handleOAuth = useCallback(
    async (provider: 'google' | 'github') => {
      setErrorTitle('OAuth not configured');
      setError(`${provider} sign in is not configured.`);
    },
    []
  );

  return {
    email,
    password,
    loading,
    setEmail,
    setPassword,
    handleEmailSignIn,
    handleOAuth,
  };
};
