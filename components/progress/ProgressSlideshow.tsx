import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import { ProgressImage } from '@/types/photo.types';
import {
  SLIDESHOW_SPEED_OPTIONS,
  type SlideshowSpeedKey,
} from '@/types/progress-view.types';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProgressSlideshowProps {
  photos: ProgressImage[];
  categoryName: string;
  speed: SlideshowSpeedKey;
  onSpeedChange: (speed: SlideshowSpeedKey) => void;
}

function formatSlideDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ProgressSlideshow({
  photos,
  categoryName,
  speed,
  onSpeedChange,
}: ProgressSlideshowProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const resetIndex = useCallback(() => {
    setIndex(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    resetIndex();
  }, [photos, resetIndex]);

  useEffect(() => {
    if (!playing || photos.length <= 1) {
      return;
    }
    const intervalMs = SLIDESHOW_SPEED_OPTIONS[speed].intervalMs;
    const timer = setInterval(() => {
      setIndex(current => (current + 1) % photos.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [playing, photos.length, speed]);

  const current = photos[index];
  if (!current) {
    return null;
  }

  const handleShareFrame = async () => {
    try {
      await Share.share({
        message: `${categoryName} progress — ${formatSlideDate(current.timestamp)}`,
        url: current.uri,
      });
    } catch {
      // User dismissed
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewer}>
        <Image
          source={{ uri: current.uri }}
          style={styles.image}
          contentFit="cover"
          recyclingKey={current.uri}
        />
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>{categoryName}</Text>
          <Text style={styles.overlayDate}>
            {formatSlideDate(current.timestamp)} · {index + 1} / {photos.length}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1))}
        >
          <IconSymbol name="chevron.left" size={22} color={FitTrackColors.onBackground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, playing && styles.playButtonActive]}
          onPress={() => setPlaying(prev => !prev)}
        >
          <Text style={styles.playLabel}>{playing ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setIndex(prev => (prev + 1) % photos.length)}
        >
          <IconSymbol name="chevron.right" size={22} color={FitTrackColors.onBackground} />
        </TouchableOpacity>
      </View>

      <View style={styles.speedRow}>
        {(Object.keys(SLIDESHOW_SPEED_OPTIONS) as SlideshowSpeedKey[]).map(key => {
          const active = speed === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.speedChip, active && styles.speedChipActive]}
              onPress={() => onSpeedChange(key)}
            >
              <Text style={[styles.speedText, active && styles.speedTextActive]}>
                {SLIDESHOW_SPEED_OPTIONS[key].label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.shareRow} onPress={() => void handleShareFrame()}>
        <IconSymbol name="square.and.arrow.up" size={18} color={FitTrackColors.primaryContainer} />
        <Text style={styles.shareText}>Share current frame</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  viewer: {
    height: 360,
    borderRadius: FitTrackRadius.xl,
    overflow: 'hidden',
    backgroundColor: FitTrackColors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(5, 20, 36, 0.65)',
  },
  overlayTitle: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 15,
    color: FitTrackColors.onBackground,
  },
  overlayDate: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    color: FitTrackColors.onSurfaceVariant,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FitTrackColors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  playButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: FitTrackColors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  playButtonActive: {
    backgroundColor: FitTrackColors.primaryContainerMuted,
    borderColor: FitTrackColors.primaryContainerBorder,
  },
  playLabel: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 15,
    color: FitTrackColors.primaryContainer,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  speedChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: FitTrackColors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  speedChipActive: {
    backgroundColor: FitTrackColors.primaryContainerMuted,
    borderColor: FitTrackColors.primaryContainerBorder,
  },
  speedText: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: FitTrackColors.onSurfaceVariant,
  },
  speedTextActive: {
    color: FitTrackColors.primaryContainer,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  shareText: {
    fontFamily: FitTrackFonts.body,
    fontSize: 14,
    color: FitTrackColors.primaryContainer,
  },
});
