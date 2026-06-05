import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { useAppLock } from '@/contexts/AppLockContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PRIVACY_POLICY_URL } from '@/constants/legal';
import { accountDeletionService } from '@/services/account-deletion.service';
import { avatarUploadService } from '@/services/avatar-upload.service';
import { dataExportService } from '@/services/data-export.service';
import { WrAuthRequestError } from '@/services/wrauth.client';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

export const useSettingsActions = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { showAlert } = useAlert();
  const { runWithLockSuspended } = useAppLock();
  const { session, signOut, updateProfile } = useAuth();
  const router = useRouter();
  const [displayNameDraft, setDisplayNameDraft] = useState('');
  const [bioDraft, setBioDraft] = useState('');
  const [avatarUriDraft, setAvatarUriDraft] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileEditVisible, setProfileEditVisible] = useState(false);
  const [deletePasswordVisible, setDeletePasswordVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exportingData, setExportingData] = useState(false);

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

    await runWithLockSuspended(async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setAvatarUriDraft(result.assets[0].uri);
      }
    });
  }, [runWithLockSuspended, showAlert, signedIn]);

  const resetProfileDrafts = useCallback(() => {
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

  const openProfileEdit = useCallback(() => {
    if (!signedIn) {
      return;
    }
    resetProfileDrafts();
    setProfileEditVisible(true);
  }, [resetProfileDrafts, signedIn]);

  const closeProfileEdit = useCallback(() => {
    setProfileEditVisible(false);
    resetProfileDrafts();
  }, [resetProfileDrafts]);

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
      const avatarUrl = await avatarUploadService.resolveAvatarForProfile(avatarUriDraft);
      await updateProfile({
        display_name: trimmedName,
        bio: bioDraft.trim() || null,
        avatar_url: avatarUrl,
      });
      setProfileEditVisible(false);
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

  const profileDisplayName = session?.display_name ?? '';
  const profileBio = session?.bio ?? null;
  const profileAvatarUri = session?.avatar_url ?? null;

  const handleExportData = useCallback(() => {
    if (exportingData) {
      return;
    }
    showAlert({
      title: 'Export Data',
      message:
        'Downloads a zip of your profile, categories, and decrypted progress photos organized by muscle group.',
      variant: 'info',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            setExportingData(true);
            void dataExportService
              .exportUserDataZip()
              .catch(error => {
                showAlert({
                  title: 'Export failed',
                  message: error instanceof Error ? error.message : 'Unable to export data.',
                  variant: 'error',
                });
              })
              .finally(() => setExportingData(false));
          },
        },
      ],
    });
  }, [exportingData, showAlert]);

  const handleAbout = useCallback(() => {
    showAlert({
      title: 'About FitTrack Progress',
      message: 'Version 1.0.0\n\nTrack your fitness journey with photos and see your progress over time.',
      variant: 'info',
    });
  }, [showAlert]);

  const handlePrivacy = useCallback(() => {
    void Linking.openURL(PRIVACY_POLICY_URL).catch(() => {
      showAlert({
        title: 'Privacy Policy',
        message:
          'Progress photos are encrypted on this device. Categories and photo records sync to your wrAuth account. Optional biometric unlock stores credentials in your device secure enclave.',
        variant: 'info',
      });
    });
  }, [showAlert]);

  const handleDeleteAccount = useCallback(() => {
    if (!signedIn || deletingAccount) {
      return;
    }
    showAlert({
      title: 'Delete account?',
      message:
        'This permanently deletes your FitTrack account, including your login, categories, photos, and all cloud storage. This cannot be undone.',
      variant: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => setDeletePasswordVisible(true),
        },
      ],
    });
  }, [deletingAccount, showAlert, signedIn]);

  const closeDeletePasswordModal = useCallback(() => {
    if (deletingAccount) {
      return;
    }
    setDeletePasswordVisible(false);
  }, [deletingAccount]);

  const confirmDeleteAccount = useCallback(
    async (password: string) => {
      setDeletingAccount(true);
      try {
        await accountDeletionService.deleteAccountAndLocalData(password);
        setDeletePasswordVisible(false);
        router.replace('/sign-in');
      } catch (error) {
        const message =
          error instanceof WrAuthRequestError && error.code === 'INVALID_PASSWORD'
            ? 'Incorrect password.'
            : error instanceof Error
              ? error.message
              : 'Unable to delete account.';
        showAlert({
          title: 'Deletion failed',
          message,
          variant: 'error',
        });
      } finally {
        setDeletingAccount(false);
      }
    },
    [router, showAlert]
  );

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
    profileDisplayName,
    profileBio,
    profileAvatarUri,
    profileEditVisible,
    openProfileEdit,
    closeProfileEdit,
    handlePickAvatar,
    handleSaveProfile,
    handleExportData,
    exportingData,
    handleAbout,
    handlePrivacy,
    handleDeleteAccount,
    deletePasswordVisible,
    deletingAccount,
    closeDeletePasswordModal,
    confirmDeleteAccount,
    handleSignOut,
  };
};
