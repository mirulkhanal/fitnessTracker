import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { supabase } from '@/services/supabase.client';
import * as Linking from 'expo-linking';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function AuthCallbackScreen() {
  const [redirectTo, setRedirectTo] = useState<'tabs' | 'sign-in' | null>(null);

  useEffect(() => {
    let active = true;
    const handleRedirect = async (url?: string | null) => {
      if (!active) return;
      if (url) {
        const parsed = Linking.parse(url);
        const code =
          typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!active) return;
          if (error) {
            setRedirectTo('sign-in');
            return;
          }
        }
      }
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setRedirectTo(data.user ? 'tabs' : 'sign-in');
    };
    const init = async () => {
      const url = await Linking.getInitialURL();
      await handleRedirect(url);
    };
    init();
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleRedirect(url);
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

  return <ScreenLoading text="Preparing sign in..." />;
}
