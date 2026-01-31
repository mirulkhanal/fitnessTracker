import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { useErrorAlert } from '@/hooks/use-error-alert';
import { useAuthStore } from '@/store/auth.store';
import * as Linking from 'expo-linking';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function AuthCallbackScreen() {
  const { session, loading, error, errorTitle, clearError, processAuthCallbackUrl } = useAuthStore();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useErrorAlert({
    title: errorTitle ?? 'Auth error',
    message: error,
    onDismiss: clearError,
  });

  useEffect(() => {
    let active = true;
    let handled = false;

    const handleUrl = async (url: string) => {
      if (!active || handled) return;
      const result = await processAuthCallbackUrl(url);
      if (!active) return;
      if (result.handled && !result.ok) {
        setShouldRedirect(true);
      }
      if (result.handled && result.ok) {
        handled = true;
      }
    };

    const init = async () => {
      const url = await Linking.getInitialURL();
      if (!active) return;
      if (url) {
        await handleUrl(url);
        return;
      }
      const result = await processAuthCallbackUrl(null);
      if (!active) return;
      if (result.handled && !result.ok) {
        setShouldRedirect(true);
      }
      if (result.handled && result.ok) {
        handled = true;
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    init();

    return () => {
      active = false;
      subscription.remove();
    };
  }, [processAuthCallbackUrl]);

  if (session) {
    return <Redirect href="/" />;
  }

  if (shouldRedirect) {
    return <Redirect href="/sign-in" />;
  }

  return <ScreenLoading text={loading ? 'Finishing sign in...' : 'Preparing sign in...'} />;
}
