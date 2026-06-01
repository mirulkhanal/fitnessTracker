import { fitnessIconIds } from '@/components/icons/custom-icons';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import { CategoryStats } from '@/types/category.types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CategoryExploreCardProps {
  category: CategoryStats;
  onPress: (category: CategoryStats) => void;
  onLongPress?: (category: CategoryStats) => void;
}

const formatLastPhoto = (timestamp?: number) => {
  if (!timestamp) {
    return 'Never';
  }
  return new Date(timestamp).toLocaleDateString();
};

const isRecentPhoto = (timestamp?: number) => {
  if (!timestamp) {
    return false;
  }
  const days = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
  return days <= 14;
};

export function CategoryExploreCard({ category, onPress, onLongPress }: CategoryExploreCardProps) {
  const hasPhotos = category.photoCount > 0;
  const chipActive = hasPhotos && isRecentPhoto(category.lastPhotoDate);
  const photoLabel =
    category.photoCount === 1 ? '1 PHOTO' : `${category.photoCount} PHOTOS`;

  const useCustomIcon = fitnessIconIds.includes(category.icon);
  const iconColor = useCustomIcon
    ? '#FFFFFF'
    : chipActive
      ? FitTrackColors.primaryContainer
      : FitTrackColors.onSurfaceVariant;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(category)}
      onLongPress={onLongPress ? () => onLongPress(category) : undefined}
      delayLongPress={400}
    >
      <GlassPanel active style={styles.card}>
        <View style={styles.cardInner}>
          <View style={styles.topRow}>
            <View
              style={[
                styles.iconBox,
                useCustomIcon ? { backgroundColor: category.color } : undefined,
              ]}
            >
              <IconSymbol name={category.icon as never} size={26} color={iconColor} />
            </View>
            {hasPhotos ? (
              <View style={[styles.chip, chipActive ? styles.chipActive : styles.chipMuted]}>
                <Text style={[styles.chipText, chipActive ? styles.chipTextActive : styles.chipTextMuted]}>
                  {photoLabel}
                </Text>
              </View>
            ) : (
              <View style={[styles.chip, styles.chipMuted]}>
                <Text style={[styles.chipText, styles.chipTextMuted]}>0 PHOTOS</Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{category.name}</Text>
          <View style={styles.lastRow}>
            <IconSymbol name="clock.fill" size={16} color={FitTrackColors.onSurfaceVariant} />
            <Text style={styles.lastText}>Last photo: {formatLastPhoto(category.lastPhotoDate)}</Text>
          </View>
        </View>
      </GlassPanel>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  cardInner: {
    padding: 20,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: FitTrackColors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: FitTrackColors.primaryContainerMuted,
    borderColor: FitTrackColors.primaryContainerBorder,
  },
  chipMuted: {
    backgroundColor: 'rgba(60, 74, 94, 0.4)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chipText: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 11,
    letterSpacing: 1,
  },
  chipTextActive: {
    color: FitTrackColors.primaryContainer,
  },
  chipTextMuted: {
    color: FitTrackColors.onSurfaceVariant,
  },
  name: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 24,
    lineHeight: 32,
    color: FitTrackColors.onBackground,
    marginBottom: 8,
  },
  lastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastText: {
    fontFamily: FitTrackFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: FitTrackColors.onSurfaceVariant,
  },
});
