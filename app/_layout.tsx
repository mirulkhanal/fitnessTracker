import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { WorkoutRemindersHost } from '@/components/settings/WorkoutRemindersHost';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { AlertProvider } from '@/contexts/AlertContext';
import { AppLockProvider, useAppLock } from '@/contexts/AppLockContext';
import { LocalProfileProvider, useLocalProfile } from '@/contexts/LocalProfileContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { appService } from '@/services/app.service';
import { biometricAuthService } from '@/services/biometric-auth.service';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const [appReady, setAppReady] = useState(appService.getInitializationStatus());
  const [startupError, setStartupError] = useState('');
  useEffect(() => {
    void appService.initialize().then(() => setAppReady(true)).catch(error => {
      setStartupError(error instanceof Error ? error.message : 'Unable to open local app storage.');
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ThemeProvider>
          {startupError ? (
            <View style={{ flex: 1, backgroundColor: '#051424', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
              <Text style={{ color: '#FFB4AB', textAlign: 'center' }}>{startupError}</Text>
            </View>
          ) : !appReady ? (
            <ScreenLoading text="Preparing local storage..." />
          ) : (
            <LocalProfileProvider>
              <AppLockProvider>
                <AlertProvider><AppContent /></AlertProvider>
              </AppLockProvider>
            </LocalProfileProvider>
          )}
        </ThemeProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { colorScheme } = useTheme();
  const { loaded: fontsLoaded } = useAppFonts();
  if (!fontsLoaded) return <ScreenLoading text="Loading..." />;

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LocalProfileRouteGuard>
        <AppLockGate>
          <WorkoutRemindersHost />
          <Stack initialRouteName="index">
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="category-selection" options={{ title: 'Category Selection', headerShown: true }} />
            <Stack.Screen name="category-view" options={{ headerShown: false }} />
          </Stack>
        </AppLockGate>
      </LocalProfileRouteGuard>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

function LocalProfileRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isLoading, profile } = useLocalProfile();

  useEffect(() => {
    if (isLoading) return;
    const root = segments[0];
    if (!profile.setup_complete && root !== 'profile-setup') router.replace('/profile-setup');
    else if (profile.setup_complete && root === 'profile-setup') router.replace('/(tabs)');
  }, [isLoading, profile.setup_complete, router, segments]);

  if (isLoading) return <ScreenLoading text="Loading your profile..." />;
  return <>{children}</>;
}

function AppLockGate({ children }: { children: React.ReactNode }) {
  const { isReady, isLocked, releaseLock } = useAppLock();
  const [error, setError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  const unlock = async () => {
    setUnlocking(true);
    setError('');
    try {
      await biometricAuthService.unlockAppAccess();
      releaseLock();
    } catch (unlockError) {
      setError(unlockError instanceof Error ? unlockError.message : 'Unable to unlock FitTrack.');
    } finally {
      setUnlocking(false);
    }
  };

  if (!isReady) return <ScreenLoading text="Opening FitTrack..." />;
  if (!isLocked) return <>{children}</>;

  return (
    <View style={{ flex: 1, backgroundColor: '#051424', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <Text style={{ color: '#9EF01A', fontSize: 26, fontWeight: '700', marginBottom: 12 }}>FitTrack is locked</Text>
      <Text style={{ color: '#C3C9B2', textAlign: 'center', marginBottom: 24 }}>Unlock to view the data stored on this device.</Text>
      {error ? <Text style={{ color: '#FFB4AB', textAlign: 'center', marginBottom: 16 }}>{error}</Text> : null}
      <TouchableOpacity onPress={() => void unlock()} disabled={unlocking} style={{ paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24, backgroundColor: '#9EF01A' }}>
        <Text style={{ color: '#051424', fontWeight: '700' }}>{unlocking ? 'Checking…' : 'Unlock with biometrics'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => void unlock()} disabled={unlocking} style={{ marginTop: 16, padding: 12 }}>
        <Text style={{ color: '#C3C9B2' }}>Use device passcode</Text>
      </TouchableOpacity>
    </View>
  );
}
