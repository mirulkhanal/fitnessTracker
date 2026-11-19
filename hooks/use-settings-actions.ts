import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { useAppLock } from '@/contexts/AppLockContext';
import { useLocalProfile } from '@/contexts/LocalProfileContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PRIVACY_POLICY_URL } from '@/constants/legal';
import { dataExportService } from '@/services/data-export.service';

export const useSettingsActions = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { showAlert } = useAlert();
  const { runWithLockSuspended } = useAppLock();
  const { profile, saveProfile } = useLocalProfile();
  const [displayNameDraft, setDisplayNameDraft] = useState('');
  const [bioDraft, setBioDraft] = useState('');
  const [avatarUriDraft, setAvatarUriDraft] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileEditVisible, setProfileEditVisible] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    setDisplayNameDraft(profile.display_name);
    setBioDraft(profile.bio ?? '');
    setAvatarUriDraft(profile.avatar_url);
  }, [profile]);

  const canSaveProfile = useMemo(() =>
    displayNameDraft.trim() !== profile.display_name ||
    bioDraft !== (profile.bio ?? '') ||
    avatarUriDraft !== profile.avatar_url,
  [avatarUriDraft, bioDraft, displayNameDraft, profile]);

  const resetProfileDrafts = useCallback(() => {
    setDisplayNameDraft(profile.display_name);
    setBioDraft(profile.bio ?? '');
    setAvatarUriDraft(profile.avatar_url);
  }, [profile]);

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert({ title: 'Permission needed', message: 'Photo library access is required to select a picture.', variant: 'warning' });
      return;
    }
    await runWithLockSuspended(async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) setAvatarUriDraft(result.assets[0].uri);
    });
  }, [runWithLockSuspended, showAlert]);

  const openProfileEdit = useCallback(() => {
    resetProfileDrafts();
    setProfileEditVisible(true);
  }, [resetProfileDrafts]);
  const closeProfileEdit = useCallback(() => {
    setProfileEditVisible(false);
    resetProfileDrafts();
  }, [resetProfileDrafts]);

  const handleSaveProfile = useCallback(async () => {
    const trimmedName = displayNameDraft.trim();
    if (!trimmedName) {
      showAlert({ title: 'Name required', message: 'Enter your name before saving.', variant: 'warning' });
      return;
    }
    setSavingProfile(true);
    try {
      await saveProfile({ display_name: trimmedName, bio: bioDraft.trim() || null, avatar_url: avatarUriDraft });
      setProfileEditVisible(false);
      showAlert({ title: 'Profile saved', message: 'Your profile was saved on this device.', variant: 'success' });
    } catch (error) {
      showAlert({ title: 'Save failed', message: error instanceof Error ? error.message : 'Unable to save your profile.', variant: 'error' });
    } finally {
      setSavingProfile(false);
    }
  }, [avatarUriDraft, bioDraft, displayNameDraft, saveProfile, showAlert]);

  const handleExportData = useCallback(() => {
    if (exportingData) return;
    showAlert({
      title: 'Export data from this device',
      message: 'FitTrack will create a ZIP from the local profile, categories, and progress photos. Choose where to save or share it.',
      variant: 'info',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          setExportingData(true);
          void dataExportService.exportUserDataZip().catch(error => {
            showAlert({ title: 'Export failed', message: error instanceof Error ? error.message : 'Unable to export data.', variant: 'error' });
          }).finally(() => setExportingData(false));
        } },
      ],
    });
  }, [exportingData, showAlert]);

  const handleAbout = useCallback(() => {
    showAlert({ title: 'About FitTrack Progress', message: 'Version 1.0.0\n\nTrack your fitness journey with photos and see your progress over time.', variant: 'info' });
  }, [showAlert]);

  const handlePrivacy = useCallback(() => {
    void Linking.openURL(PRIVACY_POLICY_URL).catch(() => {
      showAlert({ title: 'Privacy', message: 'Your profile, categories, preferences, and progress photos are stored in this app on this device. Export and sharing happen only when you choose them.', variant: 'info' });
    });
  }, [showAlert]);

  return {
    colors,
    isDarkMode,
    toggleTheme,
    displayNameDraft,
    bioDraft,
    avatarUriDraft,
    savingProfile,
    canSaveProfile,
    setDisplayNameDraft,
    setBioDraft,
    profileDisplayName: profile.display_name,
    profileBio: profile.bio,
    profileAvatarUri: profile.avatar_url,
    profileEditVisible,
    openProfileEdit,
    closeProfileEdit,
    handlePickAvatar,
    handleSaveProfile,
    handleExportData,
    exportingData,
    handleAbout,
    handlePrivacy,
  };
};
