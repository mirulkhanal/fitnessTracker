import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AlertProvider } from '@/contexts/AlertContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { appService } from '@/services/app.service';
import * as Linking from 'expo-linking';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    // Debug Linking events
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('🔗 Deep Link Received:', url);
    });
    
    // Check initial URL
    Linking.getInitialURL().then(url => {
      if (url) console.log('🔗 Initial Deep Link:', url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    appService.initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AlertProvider>
          <AppContent />
        </AlertProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { colorScheme } = useTheme();

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
        <Stack.Screen 
          name="category-view" 
          options={{ 
            title: 'Category',
            headerShown: true 
          }} 
        />
        <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}
