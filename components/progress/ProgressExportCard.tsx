import { GlassPanel } from '@/components/ui/GlassPanel';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProgressExportCardProps {
  onVideoExportPress: () => void;
  onShareableComparePress: () => void;
  shareCompareDisabled?: boolean;
  shareCompareLoading?: boolean;
}

export function ProgressExportCard({
  onVideoExportPress,
  onShareableComparePress,
  shareCompareDisabled = false,
  shareCompareLoading = false,
}: ProgressExportCardProps) {
  return (
    <GlassPanel style={styles.panel}>
      <Text style={styles.title}>Export & share</Text>
      <Text style={styles.body}>
        Export a side-by-side before/after PNG from the compare tab, or use the options below.
        Video export still requires a dev build.
      </Text>

      <TouchableOpacity style={styles.action} onPress={onVideoExportPress} activeOpacity={0.85}>
        <IconSymbol name="photo.stack" size={20} color={FitTrackColors.primaryContainer} />
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>Export progress video</Text>
          <Text style={styles.actionSubtitle}>Coming soon · dev build required</Text>
        </View>
        <IconSymbol name="chevron.right" size={18} color={FitTrackColors.onSurfaceVariant} />
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
