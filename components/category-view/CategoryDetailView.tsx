import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

export interface CategoryDetailPhoto {
  id: string;
  uri: string;
  timestamp: number;
}

interface CategoryDetailViewProps {
  categoryName: string;
  photos: CategoryDetailPhoto[];
  onDeletePhoto: (photoId: string) => void;
}

function formatPhotoDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} • ${timePart}`;
}

function formatLatestChip(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate();
  return `LATEST ${month} ${day}`;
}

interface PhotoSlideProps {
  uri: string;
  width: number;
  height: number;
}

function PhotoSlide({ uri, width, height }: PhotoSlideProps) {
  return (
    <View style={{ width, height }}>
      <Image
        source={{ uri }}
        style={{ width, height }}
        contentFit="cover"
        recyclingKey={uri}
      />
      <LinearGradient
        colors={['transparent', 'rgba(5, 20, 36, 0.4)', 'rgba(5, 20, 36, 0.9)']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

export function CategoryDetailView({
  categoryName,
  photos,
  onDeletePhoto,
}: CategoryDetailViewProps) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const viewerHeight = Math.min(800, Math.max(420, windowHeight * 0.62));
  const slideWidth = Math.max(windowWidth - 40, 280);

  const sortedPhotos = useMemo(
    () => [...photos].sort((a, b) => b.timestamp - a.timestamp),
    [photos]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const activePhoto = sortedPhotos[activeIndex] ?? null;

  useEffect(() => {
    if (sortedPhotos.length === 0) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex >= sortedPhotos.length) {
      setActiveIndex(sortedPhotos.length - 1);
    }
  }, [activeIndex, sortedPhotos.length]);

  const latestLabel =
    sortedPhotos.length > 0 ? formatLatestChip(sortedPhotos[0].timestamp) : 'LATEST —';
  const photoCountLabel =
    sortedPhotos.length === 1 ? '1 PHOTO' : `${sortedPhotos.length} PHOTOS`;

  const handleShare = async () => {
    if (!activePhoto) {
      return;
    }
    try {
      await Share.share({
        message: `${categoryName} progress photo`,
        url: activePhoto.uri,
      });
    } catch {
      // User dismissed share sheet
    }
  };

  if (sortedPhotos.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.pageTitle}>{categoryName}</Text>
        <View style={[styles.emptyCard, { minHeight: viewerHeight * 0.5 }]}>
          <IconSymbol name="photo" size={56} color={FitTrackColors.onSurfaceVariant} />
          <Text style={styles.emptyTitle}>No photos yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first progress photo to start tracking this category.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>{categoryName}</Text>

      <View style={styles.chipsRow}>
        <View style={styles.chipPrimary}>
          <IconSymbol name="photo.fill" size={16} color={FitTrackColors.primaryContainer} />
          <Text style={styles.chipPrimaryText}>{photoCountLabel}</Text>
        </View>
        <View style={styles.chipSecondary}>
          <IconSymbol name="calendar" size={16} color={FitTrackColors.onSurfaceVariant} />
          <Text style={styles.chipSecondaryText}>{latestLabel}</Text>
        </View>
      </View>

      <View style={[styles.viewerWrap, { height: viewerHeight }]}>
        <View style={styles.viewerGlow} />
        <View style={[styles.viewerCard, { height: viewerHeight }]}>
          {sortedPhotos.length === 1 ? (
            <PhotoSlide
              uri={sortedPhotos[0].uri}
              width={slideWidth}
              height={viewerHeight}
            />
          ) : (
            <FlatList
              data={sortedPhotos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              style={{ height: viewerHeight, width: slideWidth }}
              getItemLayout={(_, index) => ({
                length: slideWidth,
                offset: slideWidth * index,
                index,
              })}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
                setActiveIndex(Math.min(index, sortedPhotos.length - 1));
              }}
              renderItem={({ item }) => (
                <PhotoSlide uri={item.uri} width={slideWidth} height={viewerHeight} />
              )}
            />
          )}

          {activePhoto ? (
            <View style={styles.actionBar}>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>{categoryName}</Text>
                <Text style={styles.actionSubtitle}>
                  {formatPhotoDateTime(activePhoto.timestamp)}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShare}
                  activeOpacity={0.85}
                  accessibilityLabel="Share photo"
                >
                  <IconSymbol
                    name="square.and.arrow.up"
                    size={20}
                    color={FitTrackColors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeletePhoto(activePhoto.id)}
                  activeOpacity={0.85}
                  accessibilityLabel="Delete photo"
                >
                  <IconSymbol name="trash" size={20} color={FitTrackColors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      </View>

      {sortedPhotos.length > 1 ? (
        <View style={styles.dotsRow}>
          {sortedPhotos.map((photo, index) => (
            <View
              key={photo.id}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  pageTitle: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 28,
    lineHeight: 34,
    color: FitTrackColors.onBackground,
    letterSpacing: -0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: FitTrackColors.primaryContainerMuted,
    borderWidth: 1,
    borderColor: FitTrackColors.primaryContainerBorder,
  },
  chipPrimaryText: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: FitTrackColors.primaryContainer,
  },
  chipSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: FitTrackColors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  chipSecondaryText: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: FitTrackColors.onSurfaceVariant,
  },
  viewerWrap: {
    position: 'relative',
    width: '100%',
  },
  viewerGlow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 28,
    backgroundColor: FitTrackColors.primaryContainerMuted,
    opacity: 0.35,
  },
  viewerCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: FitTrackColors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: FitTrackRadius.lg,
    backgroundColor: 'rgba(18, 33, 49, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    flex: 1,
    marginRight: 12,
  },
  actionTitle: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 15,
    color: FitTrackColors.onBackground,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontFamily: FitTrackFonts.body,
    fontSize: 13,
    color: FitTrackColors.onSurfaceVariant,
    opacity: 0.9,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FitTrackColors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 180, 171, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 171, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: FitTrackColors.surfaceContainerHighest,
  },
  dotActive: {
    backgroundColor: FitTrackColors.primaryContainer,
    width: 18,
  },
  emptyWrap: {
    gap: 16,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: FitTrackRadius.xl,
    backgroundColor: FitTrackColors.glassFill,
    borderWidth: 1,
    borderColor: FitTrackColors.glassBorder,
  },
  emptyTitle: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 20,
    color: FitTrackColors.onBackground,
    marginTop: 8,
  },
  emptySubtitle: {
    fontFamily: FitTrackFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: FitTrackColors.onSurfaceVariant,
    textAlign: 'center',
  },
});
