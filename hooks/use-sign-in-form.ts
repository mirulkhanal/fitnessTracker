import { useCallback, useState } from 'react';

import { useErrorAlert } from '@/hooks/use-error-alert';
import { useAuthStore } from '@/store/auth.store';

export const useSignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error, errorTitle, clearError, signInWithEmail, startOAuth } = useAuthStore();

  useErrorAlert({
    title: errorTitle ?? 'Sign in failed',
    message: error,
    onDismiss: clearError,
  });

  const handleEmailSignIn = useCallback(async () => {
    const success = await signInWithEmail(email, password);
    if (success) {
      setPassword('');
    }
  }, [email, password, signInWithEmail]);

  const handleOAuth = useCallback(
    async (provider: 'google' | 'github') => {
      await startOAuth(provider);
    },
    [startOAuth]
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
