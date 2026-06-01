import { GlassPanel } from '@/components/ui/GlassPanel';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface LatestProgressPhoto {
  id: string;
  imageUri: string;
  categoryLabel: string;
  dateLabel: string;
}

interface HomeLatestProgressProps {
  photo: LatestProgressPhoto | null;
  onViewAll?: () => void;
  onDeletePhoto?: (photoId: string) => void;
  onExplorePhotos?: () => void;
}

export function HomeLatestProgress({
  photo,
  onViewAll,
  onDeletePhoto,
  onExplorePhotos,
}: HomeLatestProgressProps) {
  const [segment, setSegment] = useState<'latest' | 'photos'>('latest');

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Latest Progress</Text>
        {onViewAll ? (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} style={styles.viewAll}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
            <IconSymbol name="chevron.right" size={14} color={FitTrackColors.primaryContainer} />
          </TouchableOpacity>
        ) : null}
      </View>

      {!photo ? (
        <GlassPanel active style={styles.emptyCard}>
          <View style={styles.emptyInner}>
            <IconSymbol name="photo" size={48} color={FitTrackColors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No Photos Yet</Text>
            <Text style={styles.emptySubtitle}>
              Capture your first progress photo with the + button.
            </Text>
          </View>
        </GlassPanel>
      ) : (
        <GlassPanel active style={styles.photoCard}>
          <View style={styles.segmentRow}>
            <TouchableOpacity
              style={[styles.segment, segment === 'photos' && styles.segmentActive]}
              onPress={() => {
                setSegment('photos');
                onExplorePhotos?.();
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.segmentText, segment === 'photos' && styles.segmentTextActive]}
              >
                Photos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, segment === 'latest' && styles.segmentActive]}
              onPress={() => setSegment('latest')}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.segmentText, segment === 'latest' && styles.segmentTextActive]}
              >
                Latest
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.imageWrap}>
            <Image source={{ uri: photo.imageUri }} style={styles.image} contentFit="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(5, 20, 36, 0.2)', 'rgba(5, 20, 36, 0.95)']}
              style={styles.gradient}
            />

            <View style={styles.imageMetaBar}>
              <Text style={styles.imageDate}>{photo.dateLabel}</Text>
              {onDeletePhoto ? (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeletePhoto(photo.id)}
                  activeOpacity={0.8}
                  accessibilityLabel="Delete photo"
                >
                  <IconSymbol name="trash" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.badges}>
              <View style={styles.badgePrimary}>
                <IconSymbol name="calendar" size={14} color={FitTrackColors.primaryContainer} />
                <Text style={styles.badgePrimaryText}>{photo.dateLabel}</Text>
              </View>
              {photo.categoryLabel ? (
                <View style={styles.badgeSecondary}>
                  <IconSymbol name="figure.walk" size={14} color={FitTrackColors.onSurface} />
                  <Text style={styles.badgeSecondaryText}>{photo.categoryLabel}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </GlassPanel>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 24,
    lineHeight: 32,
    color: FitTrackColors.onBackground,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 12,
    letterSpacing: 1.2,
    color: FitTrackColors.primaryContainer,
  },
  photoCard: {
    overflow: 'hidden',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: FitTrackRadius.sm,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  segmentActive: {
    backgroundColor: FitTrackColors.surfaceContainerHighest,
  },
  segmentText: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 13,
    color: FitTrackColors.onSurfaceVariant,
  },
  segmentTextActive: {
    color: FitTrackColors.onSurface,
  },
  imageWrap: {
    aspectRatio: 4 / 5,
    width: '100%',
    backgroundColor: FitTrackColors.surfaceContainerLowest,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  imageMetaBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageDate: {
    fontFamily: FitTrackFonts.body,
    fontSize: 13,
    color: 'rgba(212, 228, 250, 0.85)',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: FitTrackColors.deleteButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgePrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: FitTrackColors.primaryContainerMuted,
    borderWidth: 1,
    borderColor: FitTrackColors.primaryContainerBorder,
  },
  badgePrimaryText: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    color: FitTrackColors.primaryContainer,
  },
  badgeSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(39, 54, 71, 0.8)',
    borderWidth: 1,
    borderColor: FitTrackColors.outlineVariant,
  },
  badgeSecondaryText: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    color: FitTrackColors.onSurface,
  },
  emptyCard: {
    minHeight: 200,
  },
  emptyInner: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 20,
    color: FitTrackColors.onBackground,
  },
  emptySubtitle: {
    fontFamily: FitTrackFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: FitTrackColors.onSurfaceVariant,
    textAlign: 'center',
  },
});
