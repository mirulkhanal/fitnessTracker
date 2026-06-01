import { useCallback, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { WrAuthRequestError, wrAuthClient } from '@/services/wrauth.client';

export const useSignupSuccess = (email: string) => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const handleResend = useCallback(async () => {
    if (!email.trim()) {
      showAlert({
        title: 'Email required',
        message: 'Go back to sign up and enter your email again.',
        variant: 'warning',
      });
      return;
    }
    setLoading(true);
    try {
      await wrAuthClient.resendVerification(email.trim());
      showAlert({
        title: 'Email sent',
        message: 'If verification is pending, a new email has been sent.',
        variant: 'info',
      });
    } catch (error) {
      const message =
        error instanceof WrAuthRequestError ? error.message : 'Unable to resend verification.';
      showAlert({
        title: 'Could not resend',
        message,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [email, showAlert]);

  return { loading, handleResend };
};
