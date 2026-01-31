import { useCallback, useEffect, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/services/supabase.client';
import { useRouter } from 'expo-router';

export const useSettingsActions = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { showAlert } = useAlert();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profile, setProfile] = useState<{
    displayName?: string;
    email?: string;
    userId?: string;
    avatarUrl?: string | null;
  }>({
    displayName: 'Guest',
    email: 'Not signed in',
    userId: 'Not available',
    avatarUrl: null,
  });

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user) {
        setProfile({
          displayName: 'Guest',
          email: 'Not signed in',
          userId: 'Not available',
          avatarUrl: null,
        });
        return;
      }
      const user = data.user;
      const displayName =
        typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : undefined;
      const avatarUrl =
        typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null;
      setProfile({
        displayName: displayName ?? user.email ?? 'Profile',
        email: user.email ?? 'Not available',
        userId: user.id,
        avatarUrl,
      });
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleExportData = useCallback(() => {
    showAlert({
      title: 'Export Data',
      message: 'This feature will allow you to export all your progress photos and data.',
      variant: 'info',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            showAlert({
              title: 'Coming Soon',
              message: 'Data export feature will be available in a future update.',
              variant: 'info',
            });
          },
        },
      ],
    });
  }, [showAlert]);

  const handleAbout = useCallback(() => {
    showAlert({
      title: 'About FitTrack Progress',
      message: 'Version 1.0.0\n\nTrack your fitness journey with photos and see your progress over time.',
      variant: 'info',
    });
  }, [showAlert]);

  const handlePrivacy = useCallback(() => {
    showAlert({
      title: 'Privacy Policy',
      message: 'Your photos are stored securely in the cloud linked to your account. We do not collect or share any personal data.',
      variant: 'info',
    });
  }, [showAlert]);

  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showAlert({
        title: 'Sign out failed',
        message: error.message,
        variant: 'error',
      });
      return;
    }
    setProfile({
      displayName: 'Guest',
      email: 'Not signed in',
      userId: 'Not available',
      avatarUrl: null,
    });
    router.replace('/sign-in');
  }, [router, showAlert]);

  return {
    colors,
    isDarkMode,
    toggleTheme,
    profile,
    notificationsEnabled,
    setNotificationsEnabled,
    handleExportData,
    handleAbout,
    handlePrivacy,
    handleSignOut,
  };
};
