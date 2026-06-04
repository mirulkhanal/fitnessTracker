import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { WorkoutRemindersHost } from '@/components/settings/WorkoutRemindersHost';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { AlertProvider } from '@/contexts/AlertContext';
import { AppLockProvider, useAppLock } from '@/contexts/AppLockContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { appService } from '@/services/app.service';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    if (!__DEV__) {
      return;
    }
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('[linking] received:', url);
    });
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('[linking] initial:', url);
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    appService.initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <AppLockProvider>
            <AlertProvider>
              <AppContent />
            </AlertProvider>
          </AppLockProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { colorScheme } = useTheme();
  const { loaded: fontsLoaded } = useAppFonts();

  if (!fontsLoaded) {
    return <ScreenLoading text="Loading..." />;
  }

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppLockGate>
        <WorkoutRemindersHost />
        <Stack initialRouteName="(tabs)">
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="category-selection"
            options={{
              title: 'Category Selection',
              headerShown: true,
            }}
          />
          <Stack.Screen name="category-view" options={{ headerShown: false }} />
          <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
        </Stack>
      </AppLockGate>
      <StatusBar style="light" />
    </NavigationThemeProvider>
  );
}

function AppLockGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isLoading, isAuthenticated } = useAuth();
  const { isReady, isLocked } = useAppLock();

  React.useEffect(() => {
    if (!isAuthenticated || !isReady || !isLocked) {
      return;
    }
    const root = segments[0];
    if (root === '(auth)' || root === '(tabs)') {
      return;
    }
    router.replace('/sign-in');
  }, [isAuthenticated, isLocked, isReady, router, segments]);

  if (isAuthenticated && (isLoading || !isReady)) {
    return <ScreenLoading text="Checking account..." />;
  }

  return <>{children}</>;
}
