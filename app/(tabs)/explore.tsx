import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { localStorageService } from '@/services/local-storage.service';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { colorScheme, colors, themeMode, isDarkMode, setThemeMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature will allow you to export all your progress photos and data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          Alert.alert('Coming Soon', 'Data export feature will be available in a future update.');
        }}
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your progress photos, categories, and streak data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await localStorageService.clearAllData();
              Alert.alert(
                'Data Cleared',
                'All your progress photos, categories, and streak data have been permanently deleted.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert(
                'Error',
                'Failed to clear data. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About FitTrack Progress',
      'Version 1.0.0\n\nTrack your fitness journey with photos and see your progress over time.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your photos are stored locally on your device. We do not collect or share any personal data.',
      [{ text: 'OK' }]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
          <IconSymbol name={icon as any} size={24} color={colors.accent} />
        </View>
        <View style={styles.settingContent}>
          <ThemedText style={styles.settingTitle}>{title}</ThemedText>
          {subtitle && <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>}
        </View>
      </View>
      {rightComponent || (onPress && <IconSymbol name="chevron.right" size={20} color={colors.icon} />)}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background, shadowOpacity: 0, elevation: 0 }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Settings</ThemedText>
        <ThemedText style={styles.subtitle}>Customize your FitTrack experience</ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Preferences */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
          
          {renderSettingItem(
            'bell.fill',
            'Notifications',
            'Get reminders to track your progress',
            undefined,
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.icon + '40', true: colors.accent + '40' }}
              thumbColor={notificationsEnabled ? colors.accent : colors.icon}
              ios_backgroundColor={colors.icon + '20'}
              style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
            />
          )}

          {renderSettingItem(
            'moon.fill',
            'Dark Mode',
            'Use dark theme throughout the app',
            undefined,
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.icon + '40', true: colors.accent + '40' }}
              thumbColor={isDarkMode ? colors.accent : colors.icon}
              ios_backgroundColor={colors.icon + '20'}
              style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
              disabled={false}
            />
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Data Management</ThemedText>
          
          {renderSettingItem(
            'square.and.arrow.up',
            'Export Data',
            'Download your progress photos and data',
            handleExportData
          )}

          {renderSettingItem(
            'trash',
            'Clear All Data',
            'Permanently delete all photos and categories',
            handleClearData
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          
          {renderSettingItem(
            'info.circle',
            'About FitTrack Progress',
            'App version and information',
            handleAbout
          )}

          {renderSettingItem(
            'hand.raised',
            'Privacy Policy',
            'How we handle your data',
            handlePrivacy
          )}
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Made with ❤️ for fitness enthusiasts
          </ThemedText>
          <ThemedText style={styles.versionText}>
            Version 1.0.0
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    opacity: 0.9,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingBottom: 60,
  },
  footerText: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.6,
  },
});