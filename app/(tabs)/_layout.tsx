import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { AnimatedTabBar } from '@/components/navigation/animated-tab-bar';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useErrorAlert } from '@/hooks/use-error-alert';
import { useAuthStore } from '@/store/auth.store';

export default function TabLayout() {
  const { colors } = useTheme();
  const { session, error, errorTitle, clearError, sessionReady } = useAuthStore();

  useErrorAlert({
    title: errorTitle ?? 'Auth error',
    message: error,
    onDismiss: clearError,
  });

  if (!sessionReady) {
    return <ScreenLoading text="Loading..." />;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: { display: 'none' },
        headerShown: false,
        animation: 'shift',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
