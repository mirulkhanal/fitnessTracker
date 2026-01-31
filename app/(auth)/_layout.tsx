import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { useErrorAlert } from '@/hooks/use-error-alert';
import { useAuthStore } from '@/store/auth.store';

export default function AuthLayout() {
  const { session, error, errorTitle, clearError, sessionReady } = useAuthStore();

  useErrorAlert({
    title: errorTitle ?? 'Auth error',
    message: error,
    onDismiss: clearError,
  });

  if (!sessionReady) {
    return <ScreenLoading text="Loading..." />;
  }

  if (session) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
