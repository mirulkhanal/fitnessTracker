import { Redirect, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { AnimatedTabBar } from '@/components/navigation/animated-tab-bar';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/services/supabase.client';

export default function TabLayout() {
  const { colors } = useTheme();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let active = true;
    const updateAuthState = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      setIsAuthed(Boolean(data.user) && !error);
      setCheckingAuth(false);
    };
    updateAuthState();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      updateAuthState();
    });
    return () => {
      active = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  if (checkingAuth) {
    return <ScreenLoading text="Checking account..." />;
  }

  if (!isAuthed) {
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
