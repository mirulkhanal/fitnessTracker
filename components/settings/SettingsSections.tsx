import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import { Session } from '@supabase/supabase-js';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
}

export function SettingItem({ icon, title, subtitle, onPress, rightComponent }: SettingItemProps) {
  const { colors } = useTheme();

  return (
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
          {subtitle ? <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText> : null}
        </View>
      </View>
      {rightComponent || (onPress ? <IconSymbol name="chevron.right" size={20} color={colors.icon} /> : null)}
    </TouchableOpacity>
  );
}

export function SettingsHeader() {
  return (
    <View style={styles.header}>
      <ThemedText type="title" style={styles.title}>Settings</ThemedText>
      <ThemedText style={styles.subtitle}>Customize your FitTrack experience</ThemedText>
    </View>
  );
}

interface ProfileSectionProps {
  session: Session | null;
}

export function ProfileSection({ session }: ProfileSectionProps) {
  const { colors } = useTheme();
  const userEmail = session?.user?.email ?? 'Not available';
  const userId = session?.user?.id ?? 'Not available';
  const displayName =
    (typeof session?.user?.user_metadata?.display_name === 'string' &&
      session?.user?.user_metadata?.display_name.trim()) ||
    (userEmail !== 'Not available' ? userEmail.split('@')[0] : 'Profile');
  const avatarUrl =
    typeof session?.user?.user_metadata?.avatar_url === 'string'
      ? session?.user?.user_metadata?.avatar_url
      : null;

  return (
    <View style={styles.profileSection}>
      <ThemedText style={styles.sectionTitle}>Profile</ThemedText>
      <View style={[styles.profileCard, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.accent + '20' }]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <ThemedText style={styles.avatarFallback}>
                {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
              </ThemedText>
            )}
          </View>
          <View style={styles.profileText}>
            <ThemedText style={styles.profileName}>{displayName}</ThemedText>
            <ThemedText style={styles.profileMeta}>{userEmail}</ThemedText>
          </View>
        </View>
        <View style={styles.profileDetailRow}>
          <ThemedText style={styles.profileDetailLabel}>User ID</ThemedText>
          <ThemedText style={styles.profileDetailValue}>{userId}</ThemedText>
        </View>
      </View>
    </View>
  );
}

interface PreferencesSectionProps {
  notificationsEnabled: boolean;
  onToggleNotifications: (value: boolean) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function PreferencesSection({
  notificationsEnabled,
  onToggleNotifications,
  isDarkMode,
  onToggleTheme,
}: PreferencesSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
      <SettingItem
        icon="bell.fill"
        title="Notifications"
        subtitle="Get reminders to track your progress"
        rightComponent={
          <Switch
            value={notificationsEnabled}
            onValueChange={onToggleNotifications}
            trackColor={{ false: colors.icon + '40', true: colors.accent + '40' }}
            thumbColor={notificationsEnabled ? colors.accent : colors.icon}
            ios_backgroundColor={colors.icon + '20'}
            style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
          />
        }
      />
      <SettingItem
        icon="moon.fill"
        title="Dark Mode"
        subtitle="Use dark theme throughout the app"
        rightComponent={
          <Switch
            value={isDarkMode}
            onValueChange={onToggleTheme}
            trackColor={{ false: colors.icon + '40', true: colors.accent + '40' }}
            thumbColor={isDarkMode ? colors.accent : colors.icon}
            ios_backgroundColor={colors.icon + '20'}
            style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
            disabled={false}
          />
        }
      />
    </View>
  );
}

interface DataManagementSectionProps {
  onExport: () => void;
}

export function DataManagementSection({ onExport }: DataManagementSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Data Management</ThemedText>
      <SettingItem
        icon="square.and.arrow.up"
        title="Export Data"
        subtitle="Download your progress photos and data"
        onPress={onExport}
      />
    </View>
  );
}

interface AccountSectionProps {
  onSignOut: () => void;
}

export function AccountSection({ onSignOut }: AccountSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Account</ThemedText>
      <SettingItem
        icon="rectangle.portrait.and.arrow.right"
        title="Sign out"
        onPress={onSignOut}
      />
    </View>
  );
}

interface AboutSectionProps {
  onAbout: () => void;
  onPrivacy: () => void;
}

export function AboutSection({ onAbout, onPrivacy }: AboutSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>About</ThemedText>
      <SettingItem
        icon="info.circle"
        title="About FitTrack Progress"
        subtitle="App version and information"
        onPress={onAbout}
      />
      <SettingItem
        icon="hand.raised"
        title="Privacy Policy"
        subtitle="How we handle your data"
        onPress={onPrivacy}
      />
    </View>
  );
}

export function SettingsFooter() {
  return (
    <View style={styles.footer}>
      <ThemedText style={styles.footerText}>Made with ❤️ for fitness enthusiasts</ThemedText>
      <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    opacity: 0.9,
  },
  profileSection: {
    marginBottom: 32,
  },
  profileCard: {
    padding: 16,
    borderRadius: 16,
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileMeta: {
    fontSize: 14,
    opacity: 0.7,
  },
  profileDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileDetailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  profileDetailValue: {
    fontSize: 13,
    opacity: 0.7,
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
