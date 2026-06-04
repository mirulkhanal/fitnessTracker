import {
  BEFORE_AFTER_EXPORT_HEIGHT,
  BEFORE_AFTER_EXPORT_WIDTH,
  BEFORE_AFTER_PHOTO_HEIGHT,
} from '@/constants/before-after-export';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import { ProgressImage } from '@/types/photo.types';
import { Image } from 'expo-image';
import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type BeforeAfterExportCanvasProps = {
  before: ProgressImage;
  after: ProgressImage;
  categoryName: string;
};

function formatExportDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const BeforeAfterExportCanvas = forwardRef<View, BeforeAfterExportCanvasProps>(
  function BeforeAfterExportCanvas({ before, after, categoryName }, ref) {
    return (
      <View ref={ref} collapsable={false} style={styles.canvas}>
        <View style={styles.header}>
          <Text style={styles.brand}>FITTRACK</Text>
          <Text style={styles.category}>{categoryName}</Text>
          <Text style={styles.tagline}>Progress comparison</Text>
        </View>

        <View style={styles.panels}>
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelLabel}>BEFORE</Text>
              <Text style={styles.panelDate}>{formatExportDate(before.timestamp)}</Text>
            </View>
            <Image
              source={{ uri: before.uri }}
              style={styles.photo}
              contentFit="cover"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelLabel}>AFTER</Text>
              <Text style={styles.panelDate}>{formatExportDate(after.timestamp)}</Text>
            </View>
            <Image
              source={{ uri: after.uri }}
              style={styles.photo}
              contentFit="cover"
            />
          </View>
        </View>

        <Text style={styles.footer}>Track your fitness journey with FitTrack Progress</Text>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  canvas: {
    width: BEFORE_AFTER_EXPORT_WIDTH,
    height: BEFORE_AFTER_EXPORT_HEIGHT,
    backgroundColor: FitTrackColors.background,
    paddingHorizontal: 40,
    paddingTop: 48,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
    gap: 6,
  },
  brand: {
    fontFamily: FitTrackFonts.display,
    fontSize: 36,
    letterSpacing: 4,
    color: FitTrackColors.primaryContainer,
  },
  category: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 28,
    color: FitTrackColors.onBackground,
  },
  tagline: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 14,
    letterSpacing: 2,
    color: FitTrackColors.onSurfaceVariant,
    marginTop: 4,
  },
  panels: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  panel: {
    flex: 1,
    gap: 12,
  },
  panelHeader: {
    gap: 4,
  },
  panelLabel: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 16,
    letterSpacing: 2,
    color: FitTrackColors.primaryContainer,
  },
  panelDate: {
    fontFamily: FitTrackFonts.body,
    fontSize: 18,
    color: FitTrackColors.onSurfaceVariant,
  },
  photo: {
    width: '100%',
    height: BEFORE_AFTER_PHOTO_HEIGHT,
    borderRadius: 16,
    backgroundColor: FitTrackColors.surfaceContainer,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  divider: {
    width: 3,
    marginTop: 48,
    borderRadius: 2,
    backgroundColor: FitTrackColors.primaryContainer,
    opacity: 0.5,
  },
  footer: {
    fontFamily: FitTrackFonts.body,
    fontSize: 16,
    color: FitTrackColors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 28,
    opacity: 0.85,
  },
});
