import { HomeTopBar } from '@/components/home/HomeTopBar';
import { DeleteAccountPasswordModal } from '@/components/settings/DeleteAccountPasswordModal';
import { ProfileEditModal } from '@/components/settings/ProfileEditModal';
import {
  AboutSection,
  AccountSection,
  DataManagementSection,
  PreferencesSection,
  ProfileCardSection,
  SecuritySection,
  SettingsFooter,
  SettingsHeader,
} from '@/components/settings/SettingsSections';
import { FitTrackColors } from '@/constants/fittrack-theme';
import { useAuth } from '@/contexts/AuthContext';
import { useBiometricLoginSetting } from '@/hooks/use-biometric-login-setting';
import { useOpenWorkoutReminders } from '@/hooks/use-open-workout-reminders';
import { useSettingsActions } from '@/hooks/use-settings-actions';
import { useWorkoutReminders } from '@/hooks/use-workout-reminders';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const HEADER_OFFSET = 108;

export default function SettingsScreen() {
  const { session } = useAuth();
  const displayName = session?.display_name?.trim() || 'Athlete';

  const {
    signedIn,
    email,
    profileDisplayName,
    profileBio,
    profileAvatarUri,
    profileEditVisible,
    openProfileEdit,
    closeProfileEdit,
    displayNameDraft,
    bioDraft,
    avatarUriDraft,
    savingProfile,
    canSaveProfile,
    setDisplayNameDraft,
    setBioDraft,
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
    isDarkMode,
    toggleTheme,
  } = useSettingsActions();
  const {
    showSetting: showBiometricSetting,
    loginLabel: biometricLabel,
    enabled: biometricEnabled,
    loading: biometricLoading,
    toggling: biometricToggling,
    handleToggle: handleToggleBiometric,
  } = useBiometricLoginSetting();
  const openWorkoutReminders = useOpenWorkoutReminders();
  const { summary: workoutRemindersSummary } = useWorkoutReminders();

  return (
    <View style={styles.container}>
      <HomeTopBar
        avatarUrl={session?.avatar_url ?? avatarUriDraft}
        displayName={displayName}
        onProfilePress={() => {}}
        onNotificationsPress={openWorkoutReminders}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_OFFSET }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsHeader />
        <ProfileCardSection
          signedIn={signedIn}
          email={email}
          displayName={profileDisplayName}
          bio={profileBio}
          avatarUri={profileAvatarUri}
          onEdit={openProfileEdit}
        />
        <PreferencesSection
          workoutRemindersSummary={workoutRemindersSummary}
          onOpenWorkoutReminders={openWorkoutReminders}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
        <SecuritySection
          showBiometricSetting={showBiometricSetting}
          biometricLabel={biometricLabel}
          biometricEnabled={biometricEnabled}
          biometricLoading={biometricLoading}
          biometricToggling={biometricToggling}
          onToggleBiometric={handleToggleBiometric}
        />
        <DataManagementSection onExport={handleExportData} exporting={exportingData} />
        <AccountSection
          signedIn={signedIn}
          onSignOut={handleSignOut}
          onDeleteAccount={handleDeleteAccount}
        />
        <AboutSection onAbout={handleAbout} onPrivacy={handlePrivacy} />
        <SettingsFooter />
      </ScrollView>

      <DeleteAccountPasswordModal
        visible={deletePasswordVisible}
        deleting={deletingAccount}
        onClose={closeDeletePasswordModal}
        onConfirm={password => {
          void confirmDeleteAccount(password);
        }}
      />

      <ProfileEditModal
        visible={profileEditVisible}
        email={email}
        displayName={displayNameDraft}
        bio={bioDraft}
        avatarUri={avatarUriDraft}
        saving={savingProfile}
        canSave={canSaveProfile}
        onDisplayNameChange={setDisplayNameDraft}
        onBioChange={setBioDraft}
        onPickAvatar={handlePickAvatar}
        onSave={handleSaveProfile}
        onClose={closeProfileEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FitTrackColors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});
