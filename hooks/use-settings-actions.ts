import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { WrAuthRequestError } from '@/services/wrauth.client';
import { useRouter } from 'expo-router';

export const useSettingsActions = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { showAlert } = useAlert();
  const { session, signOut, updateProfile } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [displayNameDraft, setDisplayNameDraft] = useState('');
  const [bioDraft, setBioDraft] = useState('');
  const [avatarUriDraft, setAvatarUriDraft] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const signedIn = Boolean(session?.user);
  const email = session?.user?.email ?? 'Not signed in';

  useEffect(() => {
    if (!session?.user) {
      setDisplayNameDraft('');
      setBioDraft('');
      setAvatarUriDraft(null);
      return;
    }
    setDisplayNameDraft(session.display_name ?? '');
    setBioDraft(session.bio ?? '');
    setAvatarUriDraft(session.avatar_url ?? null);
  }, [session]);

  const canSaveProfile = useMemo(() => {
    if (!signedIn || !session) {
      return false;
    }
    const baselineName = session.display_name ?? '';
    const baselineBio = session.bio ?? '';
    const baselineAvatar = session.avatar_url ?? null;
    return (
      displayNameDraft.trim() !== baselineName ||
      bioDraft !== baselineBio ||
      avatarUriDraft !== baselineAvatar
    );
  }, [avatarUriDraft, bioDraft, displayNameDraft, session, signedIn]);

  const handlePickAvatar = useCallback(async () => {
    if (!signedIn) {
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert({
        title: 'Permission needed',
        message: 'Photo library access is required to select a picture.',
        variant: 'warning',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUriDraft(result.assets[0].uri);
    }
  }, [showAlert, signedIn]);

  const handleSaveProfile = useCallback(async () => {
    if (!signedIn || !canSaveProfile) {
      return;
    }
    const trimmedName = displayNameDraft.trim();
    if (!trimmedName) {
      showAlert({
        title: 'Display name required',
        message: 'Enter a display name before saving.',
        variant: 'warning',
      });
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        display_name: trimmedName,
        bio: bioDraft.trim() || null,
        avatar_url: avatarUriDraft,
      });
      showAlert({
        title: 'Profile saved',
        message: 'Your profile was updated.',
        variant: 'success',
      });
    } catch (error) {
      const message =
        error instanceof WrAuthRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Unable to save your profile.';
      showAlert({
        title: 'Save failed',
        message,
        variant: 'error',
      });
    } finally {
      setSavingProfile(false);
    }
  }, [
    avatarUriDraft,
    bioDraft,
    canSaveProfile,
    displayNameDraft,
    showAlert,
    signedIn,
    updateProfile,
  ]);

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
      message:
        'Progress photos are encrypted on this device. Categories and photo records sync to your wrAuth account. Optional fingerprint sign-in stores a device-protected refresh token only on this phone.',
      variant: 'info',
    });
  }, [showAlert]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (error) {
      showAlert({
        title: 'Sign out failed',
        message: error instanceof Error ? error.message : 'Unable to sign out.',
        variant: 'error',
      });
    }
  }, [router, showAlert, signOut]);

  return {
    colors,
    isDarkMode,
    toggleTheme,
    signedIn,
    email,
    displayNameDraft,
    bioDraft,
    avatarUriDraft,
    savingProfile,
    canSaveProfile,
    setDisplayNameDraft,
    setBioDraft,
    handlePickAvatar,
    handleSaveProfile,
    notificationsEnabled,
    setNotificationsEnabled,
    handleExportData,
    handleAbout,
    handlePrivacy,
    handleSignOut,
  };
};
