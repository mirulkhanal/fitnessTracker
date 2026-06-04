import { GlassPanel } from '@/components/ui/GlassPanel';
import { FitTrackSwitch } from '@/components/ui/FitTrackSwitch';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

interface SettingRowProps {
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  showDivider?: boolean;
}

function SettingRow({ icon, title, subtitle, onPress, right, showDivider }: SettingRowProps) {
  const content = (
    <View style={[styles.settingRow, showDivider && styles.settingRowDivider]}>
      <View style={styles.settingIconWrap}>
        <IconSymbol name={icon} size={22} color={FitTrackColors.primaryContainer} />
      </View>
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? (
        <IconSymbol name="chevron.right" size={20} color={FitTrackColors.onSurfaceVariant} />
      ) : null)}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export function SettingsHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Settings</Text>
      <Text style={styles.headerSubtitle}>Customize your FitTrack experience</Text>
    </View>
  );
}

interface ProfileCardSectionProps {
  signedIn: boolean;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUri: string | null;
  onEdit: () => void;
}

export function ProfileCardSection({
  signedIn,
  email,
  displayName,
  bio,
  avatarUri,
  onEdit,
}: ProfileCardSectionProps) {
  const avatarSource = useAuthenticatedImageSource(avatarUri);
  const name =
    displayName.trim() ||
    (email !== 'Not signed in' && email !== 'Not available' ? email.split('@')[0] : 'Athlete');
  const bioText = bio?.trim();

  return (
    <View style={styles.section}>
      <SectionLabel>PROFILE</SectionLabel>
      <GlassPanel style={styles.profileCard}>
        {!signedIn ? (
          <Text style={styles.signedOutText}>Sign in to view and edit your profile.</Text>
        ) : (
          <View style={styles.profileCardInner}>
            <View style={styles.avatar}>
              {avatarSource ? (
                <Image source={avatarSource} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Text style={styles.avatarFallback}>{name.charAt(0).toUpperCase()}</Text>
              )}
            </View>

            <View style={styles.profileCardBody}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileEmailMuted}>{email}</Text>
              {bioText ? (
                <Text style={styles.profileBio} numberOfLines={3}>
                  {bioText}
                </Text>
              ) : (
                <Text style={styles.profileBioPlaceholder}>No bio yet</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={onEdit}
              activeOpacity={0.85}
              accessibilityLabel="Edit profile"
            >
              <IconSymbol name="pencil" size={20} color={FitTrackColors.primaryContainer} />
            </TouchableOpacity>
          </View>
        )}
      </GlassPanel>
    </View>
  );
}

interface PreferencesSectionProps {
  workoutRemindersSummary: string;
  onOpenWorkoutReminders: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function PreferencesSection({
  workoutRemindersSummary,
  onOpenWorkoutReminders,
  isDarkMode,
  onToggleTheme,
}: PreferencesSectionProps) {
  return (
    <View style={styles.section}>
      <SectionLabel>PREFERENCES</SectionLabel>
      <GlassPanel style={styles.glassCardTight}>
        <SettingRow
          icon="bell.fill"
          title="Workout reminders"
          subtitle={workoutRemindersSummary}
          onPress={onOpenWorkoutReminders}
          showDivider
        />
        <SettingRow
          icon="moon.fill"
          title="Dark Mode"
          subtitle="Use dark theme throughout the app"
          right={<FitTrackSwitch value={isDarkMode} onValueChange={() => onToggleTheme()} />}
        />
      </GlassPanel>
    </View>
  );
}

interface SecuritySectionProps {
  showBiometricSetting: boolean;
  biometricLabel: string;
  biometricEnabled: boolean;
  biometricLoading: boolean;
  biometricToggling: boolean;
  onToggleBiometric: (value: boolean) => void;
}

export function SecuritySection({
  showBiometricSetting,
  biometricLabel,
  biometricEnabled,
  biometricLoading,
  biometricToggling,
  onToggleBiometric,
}: SecuritySectionProps) {
  if (!showBiometricSetting) {
    return null;
  }

  const subtitle = biometricLoading
    ? 'Checking device…'
    : `Require ${biometricLabel.toLowerCase()} to open the app while staying signed in`;

  return (
    <View style={styles.section}>
      <SectionLabel>SECURITY</SectionLabel>
      <GlassPanel style={styles.glassCardTight}>
        <SettingRow
          icon="touchid"
          title={`${biometricLabel} unlock`}
          subtitle={subtitle}
          right={
            <FitTrackSwitch
              value={biometricEnabled}
              onValueChange={onToggleBiometric}
              disabled={biometricLoading || biometricToggling}
            />
          }
        />
      </GlassPanel>
    </View>
  );
}

interface DataManagementSectionProps {
  onExport: () => void;
}

export function DataManagementSection({ onExport }: DataManagementSectionProps) {
  return (
    <View style={styles.section}>
      <SectionLabel>DATA MANAGEMENT</SectionLabel>
      <GlassPanel style={styles.glassCardTight}>
        <SettingRow
          icon="square.and.arrow.up"
          title="Export Data"
          subtitle="Download your progress photos and data"
          onPress={onExport}
        />
      </GlassPanel>
    </View>
  );
}

interface AccountSectionProps {
  onSignOut: () => void;
}

export function AccountSection({ onSignOut }: AccountSectionProps) {
  return (
    <View style={styles.section}>
      <SectionLabel>ACCOUNT</SectionLabel>
      <GlassPanel style={styles.glassCardTight}>
        <SettingRow icon="rectangle.portrait.and.arrow.right" title="Sign out" onPress={onSignOut} />
      </GlassPanel>
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
      <SectionLabel>ABOUT</SectionLabel>
      <GlassPanel style={styles.glassCardTight}>
        <SettingRow
          icon="info.circle"
          title="About FitTrack Progress"
          subtitle="App version and information"
          onPress={onAbout}
          showDivider
        />
        <SettingRow
          icon="hand.raised"
          title="Privacy Policy"
          subtitle="How we handle your data"
          onPress={onPrivacy}
        />
      </GlassPanel>
    </View>
  );
}

export function SettingsFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Made with ❤️ for fitness enthusiasts</Text>
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headerTitle: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 32,
    lineHeight: 40,
    color: FitTrackColors.onBackground,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: FitTrackFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: FitTrackColors.onSurfaceVariant,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 11,
    letterSpacing: 1.4,
    color: FitTrackColors.onSurfaceVariant,
    marginBottom: 12,
    paddingLeft: 8,
    textTransform: 'uppercase',
  },
  glassCard: {
    borderRadius: FitTrackRadius.xl,
    padding: 20,
    gap: 20,
  },
  profileCard: {
    borderRadius: FitTrackRadius.xl,
    padding: 18,
  },
  profileCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  profileCardBody: {
    flex: 1,
    gap: 4,
    paddingRight: 4,
  },
  profileName: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 20,
    lineHeight: 26,
    color: FitTrackColors.onBackground,
  },
  profileEmailMuted: {
    fontFamily: FitTrackFonts.body,
    fontSize: 14,
    color: FitTrackColors.onSurfaceVariant,
  },
  profileBio: {
    fontFamily: FitTrackFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: FitTrackColors.onSurface,
    marginTop: 6,
    opacity: 0.9,
  },
  profileBioPlaceholder: {
    fontFamily: FitTrackFonts.body,
    fontSize: 14,
    color: FitTrackColors.onSurfaceVariant,
    marginTop: 6,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FitTrackColors.primaryContainerMuted,
    borderWidth: 1,
    borderColor: FitTrackColors.primaryContainerBorder,
  },
  glassCardTight: {
    borderRadius: FitTrackRadius.xl,
    overflow: 'hidden',
  },
  signedOutText: {
    fontFamily: FitTrackFonts.body,
    fontSize: 15,
    color: FitTrackColors.onSurfaceVariant,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: FitTrackColors.surfaceContainerHighest,
    backgroundColor: FitTrackColors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 24,
    color: FitTrackColors.onSecondaryContainer,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  settingRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FitTrackColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingCopy: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 16,
    color: FitTrackColors.onSurface,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontFamily: FitTrackFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: FitTrackColors.onSurfaceVariant,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 48,
  },
  footerText: {
    fontFamily: FitTrackFonts.body,
    fontSize: 14,
    color: FitTrackColors.onSurfaceVariant,
    marginBottom: 6,
  },
  versionText: {
    fontFamily: FitTrackFonts.body,
    fontSize: 12,
    color: FitTrackColors.onSurfaceVariant,
    opacity: 0.8,
  },
});
