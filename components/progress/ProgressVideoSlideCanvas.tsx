import {
  PROGRESS_VIDEO_HEIGHT,
  PROGRESS_VIDEO_WIDTH,
} from '@/constants/progress-video-export';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import { ProgressImage } from '@/types/photo.types';
import { Image } from 'expo-image';
import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type ProgressVideoSlideCanvasProps = {
  photo: ProgressImage;
  categoryName: string;
  slideIndex: number;
  slideTotal: number;
};

function formatSlideDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const ProgressVideoSlideCanvas = forwardRef<View, ProgressVideoSlideCanvasProps>(
  function ProgressVideoSlideCanvas({ photo, categoryName, slideIndex, slideTotal }, ref) {
    return (
      <View ref={ref} collapsable={false} style={styles.canvas}>
        <View style={styles.header}>
          <Text style={styles.brand}>FITTRACK</Text>
          <Text style={styles.category}>{categoryName}</Text>
        </View>

        <View style={styles.viewer}>
          <Image source={{ uri: photo.uri }} style={styles.image} contentFit="cover" />
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>{categoryName}</Text>
            <Text style={styles.overlayDate}>
              {formatSlideDate(photo.timestamp)} · {slideIndex + 1} / {slideTotal}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>FitTrack Progress</Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  canvas: {
    width: PROGRESS_VIDEO_WIDTH,
    height: PROGRESS_VIDEO_HEIGHT,
    backgroundColor: FitTrackColors.background,
    paddingHorizontal: 48,
    paddingTop: 56,
    paddingBottom: 48,
    gap: 28,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontFamily: FitTrackFonts.display,
    fontSize: 40,
    letterSpacing: 4,
    color: FitTrackColors.primaryContainer,
  },
  category: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 32,
    color: FitTrackColors.onBackground,
    textAlign: 'center',
  },
  viewer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: FitTrackColors.surfaceContainerLow,
    borderWidth: 2,
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
    paddingHorizontal: 28,
    paddingVertical: 24,
    backgroundColor: 'rgba(5, 20, 36, 0.72)',
  },
  overlayTitle: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 28,
    color: FitTrackColors.onBackground,
  },
  overlayDate: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 20,
    letterSpacing: 0.5,
    color: FitTrackColors.onSurfaceVariant,
    marginTop: 8,
  },
  footer: {
    fontFamily: FitTrackFonts.body,
    fontSize: 22,
    color: FitTrackColors.onSurfaceVariant,
    textAlign: 'center',
    opacity: 0.85,
  },
});
