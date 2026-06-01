import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { AlertProvider } from '@/contexts/AlertContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useAppFonts } from '@/hooks/use-app-fonts';
import { appService } from '@/services/app.service';
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
          <AlertProvider>
            <AppContent />
          </AlertProvider>
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
      <Stack initialRouteName="(tabs)">
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="category-selection" 
          options={{ 
            title: 'Category Selection',
            headerShown: true 
          }} 
        />
        <Stack.Screen name="category-view" options={{ headerShown: false }} />
        <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </NavigationThemeProvider>
  );
}
