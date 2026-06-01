import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { wrAuthClient } from '@/services/wrauth.client';
import { wrauthConfigured } from '@/services/wrauth.config';
import * as Linking from 'expo-linking';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';

type RedirectTarget = 'tabs' | 'sign-in' | null;

const getTokenFromUrl = (url: string | null | undefined) => {
  if (!url) {
    return null;
  }
  const parsed = Linking.parse(url);
  const token = parsed.queryParams?.token;
  return typeof token === 'string' ? token : null;
};

export default function AuthCallbackScreen() {
  const [redirectTo, setRedirectTo] = useState<RedirectTarget>(null);
  useEffect(() => {
    let active = true;

    const handleUrl = async (url: string | null | undefined) => {
      if (!active) {
        return;
      }

      const token = getTokenFromUrl(url);
      if (!token) {
        setRedirectTo('sign-in');
        return;
      }

      if (!wrauthConfigured) {
        setRedirectTo('sign-in');
        return;
      }

      try {
        await wrAuthClient.verifyEmailWithToken(token);
      } catch {
        // Token may already be consumed by the email bridge page — still send user to sign in.
      }
      if (!active) {
        return;
      }
      setRedirectTo('sign-in');
    };

    const init = async () => {
      const initialUrl = await Linking.getInitialURL();
      await handleUrl(initialUrl);
    };

    void init();
    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleUrl(url);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  if (redirectTo === 'tabs') {
    return <Redirect href="/(tabs)" />;
  }

  if (redirectTo === 'sign-in') {
    return <Redirect href="/sign-in" />;
  }

  return <ScreenLoading text="Confirming your email..." />;
}
