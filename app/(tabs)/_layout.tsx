import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { AnimatedTabBar } from '@/components/navigation/animated-tab-bar';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppLock } from '@/contexts/AppLockContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useStoreErrorAlerts } from '@/hooks/use-store-error-alerts';

export default function TabLayout() {
  useStoreErrorAlerts();
  const { colors } = useTheme();
  const { isLoading, isAuthenticated } = useAuth();
  const { isLocked } = useAppLock();

  if (isLoading) {
    return <ScreenLoading text="Checking account..." />;
  }

  if (!isAuthenticated || isLocked) {
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
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.grid.2x2" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.line.uptrend.xyaxis" color={color} />
          ),
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
