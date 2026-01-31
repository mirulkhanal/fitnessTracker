import { useCallback, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { useAuthStore } from '@/store/auth.store';

export const useSettingsActions = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { session, refreshSession, signOut } = useAuthStore();
  const { showAlert } = useAlert();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useRefreshOnFocus(() => refreshSession(), [refreshSession]);

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
    await signOut();
  }, [signOut]);

  return {
    colors,
    isDarkMode,
    toggleTheme,
    session,
    notificationsEnabled,
    setNotificationsEnabled,
    handleExportData,
    handleAbout,
    handlePrivacy,
    handleSignOut,
  };
};
