import { HomeTopBar } from '@/components/home/HomeTopBar';
import {
  AboutSection,
  AccountSection,
  DataManagementSection,
  PreferencesSection,
  ProfileEditSection,
  SecuritySection,
  SettingsFooter,
  SettingsHeader,
} from '@/components/settings/SettingsSections';
import { FitTrackColors } from '@/constants/fittrack-theme';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBiometricLoginSetting } from '@/hooks/use-biometric-login-setting';
import { useSettingsActions } from '@/hooks/use-settings-actions';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const HEADER_OFFSET = 108;

export default function SettingsScreen() {
  const { showAlert } = useAlert();
  const { session } = useAuth();
  const displayName = session?.display_name?.trim() || 'Athlete';

  const {
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

  return (
    <View style={styles.container}>
      <HomeTopBar
        avatarUrl={session?.avatar_url ?? avatarUriDraft}
        displayName={displayName}
        onProfilePress={() => {}}
        onNotificationsPress={() => {
          showAlert({
            title: 'Notifications',
            message: 'Workout reminders are coming in a future update.',
            variant: 'info',
          });
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: HEADER_OFFSET }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsHeader />
        <ProfileEditSection
          signedIn={signedIn}
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
        />
        <PreferencesSection
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={setNotificationsEnabled}
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
        <DataManagementSection onExport={handleExportData} />
        <AccountSection onSignOut={handleSignOut} />
        <AboutSection onAbout={handleAbout} onPrivacy={handlePrivacy} />
        <SettingsFooter />
      </ScrollView>
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
