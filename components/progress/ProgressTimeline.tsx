import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import { ProgressImage } from '@/types/photo.types';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressTimelineProps {
  photos: ProgressImage[];
  categoryName: string;
}

function formatTimelineDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimelineTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ProgressTimeline({ photos, categoryName }: ProgressTimelineProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {categoryName} — {photos.length === 1 ? '1 entry' : `${photos.length} entries`}
      </Text>
      <Text style={styles.subheading}>Oldest at top, newest at bottom</Text>

      {photos.map((photo, index) => {
        const isFirst = index === 0;
        const isLast = index === photos.length - 1;
        return (
          <View key={photo.id} style={styles.entry}>
            <View style={styles.rail}>
              <View style={[styles.dot, (isFirst || isLast) && styles.dotHighlight]} />
              {index < photos.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.card}>
              <View style={styles.meta}>
                <Text style={styles.date}>{formatTimelineDate(photo.timestamp)}</Text>
                <Text style={styles.time}>{formatTimelineTime(photo.timestamp)}</Text>
                {isFirst ? <Text style={styles.badge}>DAY 1</Text> : null}
                {isLast && photos.length > 1 ? <Text style={styles.badgeLatest}>LATEST</Text> : null}
              </View>
              <Image
                source={{ uri: photo.uri }}
                style={styles.thumb}
                contentFit="cover"
                recyclingKey={photo.uri}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heading: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 15,
    color: FitTrackColors.onBackground,
  },
  subheading: {
    fontFamily: FitTrackFonts.body,
    fontSize: 13,
    color: FitTrackColors.onSurfaceVariant,
    marginBottom: 4,
  },
  entry: {
    flexDirection: 'row',
    gap: 12,
  },
  rail: {
    width: 16,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: FitTrackColors.surfaceContainerHighest,
    borderWidth: 2,
    borderColor: FitTrackColors.outline,
  },
  dotHighlight: {
    backgroundColor: FitTrackColors.primaryContainer,
    borderColor: FitTrackColors.primaryContainer,
  },
  line: {
    flex: 1,
    width: 2,
    minHeight: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 4,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: FitTrackRadius.lg,
    backgroundColor: FitTrackColors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 8,
  },
  meta: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  date: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 14,
    color: FitTrackColors.onBackground,
  },
  time: {
    fontFamily: FitTrackFonts.body,
    fontSize: 12,
    color: FitTrackColors.onSurfaceVariant,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    fontFamily: FitTrackFonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: FitTrackColors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: FitTrackColors.primaryContainerMuted,
    overflow: 'hidden',
  },
  badgeLatest: {
    alignSelf: 'flex-start',
    marginTop: 6,
    fontFamily: FitTrackFonts.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: FitTrackColors.onSurfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: FitTrackColors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: FitTrackRadius.md,
    backgroundColor: FitTrackColors.surfaceContainerLow,
  },
});
