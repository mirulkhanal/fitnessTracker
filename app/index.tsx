import { Redirect } from 'expo-router';
import React from 'react';

import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { useAppLock } from '@/contexts/AppLockContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isReady, isLocked } = useAppLock();

  if (isLoading || (isAuthenticated && !isReady)) {
    return <ScreenLoading text="Checking account..." />;
  }

  if (!isAuthenticated || isLocked) {
    return <Redirect href="/sign-in" />;
  }

  return <Redirect href="/(tabs)" />;
}
