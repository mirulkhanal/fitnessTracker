import { GlassPanel } from '@/components/ui/GlassPanel';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProgressExportCardProps {
  videoExportAvailable: boolean;
  videoExporting: boolean;
  videoExportProgress: number;
  onVideoExportPress: () => void;
  onShareableComparePress: () => void;
  shareCompareDisabled?: boolean;
  shareCompareLoading?: boolean;
}

export function ProgressExportCard({
  videoExportAvailable,
  videoExporting,
  videoExportProgress,
  onVideoExportPress,
  onShareableComparePress,
  shareCompareDisabled = false,
  shareCompareLoading = false,
}: ProgressExportCardProps) {
  const videoProgressLabel =
    videoExporting && videoExportProgress > 0
      ? `Encoding… ${Math.round(videoExportProgress * 100)}%`
      : videoExporting
        ? 'Preparing frames…'
        : null;

  return (
    <GlassPanel style={styles.panel}>
      <Text style={styles.title}>Export & share</Text>
      <Text style={styles.body}>
        Export a slideshow MP4 timed to your speed setting, or share a before/after PNG from the
        compare tab.
      </Text>

      <TouchableOpacity
        style={[styles.action, (!videoExportAvailable || videoExporting) && styles.actionDisabled]}
        onPress={onVideoExportPress}
        disabled={!videoExportAvailable || videoExporting}
        activeOpacity={0.85}
      >
        {videoExporting ? (
          <ActivityIndicator size="small" color={FitTrackColors.primaryContainer} />
        ) : (
          <IconSymbol name="photo.stack" size={20} color={FitTrackColors.primaryContainer} />
        )}
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>Export progress video</Text>
          <Text style={styles.actionSubtitle}>
            {videoProgressLabel ??
              (videoExportAvailable
                ? 'MP4 · matches slideshow speed'
                : 'Requires dev or production build')}
          </Text>
        </View>
        {!videoExporting ? (
          <IconSymbol name="chevron.right" size={18} color={FitTrackColors.onSurfaceVariant} />
        ) : null}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.action, shareCompareDisabled && styles.actionDisabled]}
        onPress={onShareableComparePress}
        disabled={shareCompareDisabled || shareCompareLoading}
        activeOpacity={0.85}
      >
        <IconSymbol name="rectangle.fill" size={20} color={FitTrackColors.primaryContainer} />
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>Share before/after image</Text>
          <Text style={styles.actionSubtitle}>
            {shareCompareLoading
              ? 'Creating image…'
              : shareCompareDisabled
                ? 'Need 2+ photos in category'
                : 'Side-by-side PNG · share or save'}
          </Text>
        </View>
        <IconSymbol name="chevron.right" size={18} color={FitTrackColors.onSurfaceVariant} />
      </TouchableOpacity>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 18,
    color: FitTrackColors.onBackground,
  },
  body: {
    fontFamily: FitTrackFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: FitTrackColors.onSurfaceVariant,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionDisabled: {
    opacity: 0.45,
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 14,
    color: FitTrackColors.onBackground,
  },
  actionSubtitle: {
    fontFamily: FitTrackFonts.body,
    fontSize: 12,
    color: FitTrackColors.onSurfaceVariant,
  },
});
