import { HomeTopBar } from '@/components/home/HomeTopBar';
import { ProfileEditModal } from '@/components/settings/ProfileEditModal';
import {
  AboutSection,
  DataManagementSection,
  PreferencesSection,
  ProfileCardSection,
  SecuritySection,
  SettingsFooter,
  SettingsHeader,
} from '@/components/settings/SettingsSections';
import { useTheme } from '@/contexts/ThemeContext';
import { useBiometricAppLockSetting } from '@/hooks/use-biometric-app-lock-setting';
import { useOpenWorkoutReminders } from '@/hooks/use-open-workout-reminders';
import { useSettingsActions } from '@/hooks/use-settings-actions';
import { useWorkoutReminders } from '@/hooks/use-workout-reminders';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const HEADER_OFFSET = 108;

export default function SettingsScreen() {
  const { fitTrackColors } = useTheme();
  const {
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
    isDarkMode,
    toggleTheme,
  } = useSettingsActions();
  const {
    showSetting: showBiometricSetting,
    biometricLabel,
    enabled: biometricEnabled,
    loading: biometricLoading,
    toggling: biometricToggling,
    handleToggle: handleToggleBiometric,
  } = useBiometricAppLockSetting();
  const openWorkoutReminders = useOpenWorkoutReminders();
  const { summary: workoutRemindersSummary } = useWorkoutReminders();
  const displayName = profileDisplayName.trim() || 'Athlete';

  return (
    <View style={[styles.container, { backgroundColor: fitTrackColors.background }]}>
      <HomeTopBar avatarUrl={profileAvatarUri} displayName={displayName} onProfilePress={() => {}} onNotificationsPress={openWorkoutReminders} />
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_OFFSET }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <SettingsHeader />
        <ProfileCardSection displayName={profileDisplayName} bio={profileBio} avatarUri={profileAvatarUri} onEdit={openProfileEdit} />
        <PreferencesSection workoutRemindersSummary={workoutRemindersSummary} onOpenWorkoutReminders={openWorkoutReminders} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
        <SecuritySection showBiometricSetting={showBiometricSetting} biometricLabel={biometricLabel} biometricEnabled={biometricEnabled} biometricLoading={biometricLoading} biometricToggling={biometricToggling} onToggleBiometric={handleToggleBiometric} />
        <DataManagementSection onExport={handleExportData} exporting={exportingData} />
        <AboutSection onAbout={handleAbout} onPrivacy={handlePrivacy} />
        <SettingsFooter />
      </ScrollView>
      <ProfileEditModal
        visible={profileEditVisible}
        profileNote="Stored only on this device"
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
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
});
