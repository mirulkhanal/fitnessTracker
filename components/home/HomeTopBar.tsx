import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeTopBarProps {
  avatarUrl?: string | null;
  displayName?: string;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onBackPress?: () => void;
}

const getInitial = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) {
    return '?';
  }
  return trimmed.charAt(0).toUpperCase();
};

export function HomeTopBar({
  avatarUrl,
  displayName = 'Athlete',
  onNotificationsPress,
  onProfilePress,
  onBackPress,
}: HomeTopBarProps) {
  const insets = useSafeAreaInsets();
  const hasAvatar = Boolean(avatarUrl?.trim());

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: insets.top + 8,
          backgroundColor: FitTrackColors.barBackground,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.profileButton}
        onPress={onBackPress ?? onProfilePress}
        activeOpacity={0.8}
        accessibilityLabel={onBackPress ? 'Go back' : 'Profile'}
      >
        {hasAvatar ? (
          <Image source={{ uri: avatarUrl! }} style={styles.avatarImage} contentFit="cover" />
        ) : onBackPress ? (
          <IconSymbol name="chevron.left" size={22} color={FitTrackColors.onSurfaceVariant} />
        ) : (
          <Text style={styles.avatarFallback}>{getInitial(displayName)}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.brand}>FITTRACK</Text>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={onNotificationsPress}
        activeOpacity={0.8}
        accessibilityLabel="Notifications"
      >
        <IconSymbol name="bell.fill" size={22} color={FitTrackColors.onSurfaceVariant} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FitTrackColors.glassBorder,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: FitTrackColors.secondaryContainer,
    borderWidth: 1,
    borderColor: FitTrackColors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 16,
    color: FitTrackColors.onSecondaryContainer,
  },
  brand: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 15,
    letterSpacing: 1,
    color: FitTrackColors.primaryContainer,
    marginHorizontal: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
