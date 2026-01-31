import {
    AboutSection,
    AccountSection,
    DataManagementSection,
    PreferencesSection,
    ProfileSection,
    SettingsFooter,
    SettingsHeader,
} from '@/components/settings/SettingsSections';
import { ThemedView } from '@/components/ui/themed-view';
import { useSettingsActions } from '@/hooks/use-settings-actions';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  const {
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
  } = useSettingsActions();

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background, shadowOpacity: 0, elevation: 0 }]}>
      <SettingsHeader />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileSection profile={profile} />
        <PreferencesSection
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={setNotificationsEnabled}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
        <DataManagementSection onExport={handleExportData} />
        <AccountSection onSignOut={handleSignOut} />
        <AboutSection onAbout={handleAbout} onPrivacy={handlePrivacy} />
        <SettingsFooter />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
