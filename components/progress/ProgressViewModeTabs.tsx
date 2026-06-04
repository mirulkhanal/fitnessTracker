import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import type { ProgressViewMode } from '@/types/progress-view.types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MODES: { id: ProgressViewMode; label: string }[] = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'compare', label: 'Before / After' },
  { id: 'slideshow', label: 'Slideshow' },
];

interface ProgressViewModeTabsProps {
  value: ProgressViewMode;
  onChange: (mode: ProgressViewMode) => void;
  compareDisabled?: boolean;
  slideshowDisabled?: boolean;
}

export function ProgressViewModeTabs({
  value,
  onChange,
  compareDisabled = false,
  slideshowDisabled = false,
}: ProgressViewModeTabsProps) {
  const isDisabled = (mode: ProgressViewMode) => {
    if (mode === 'compare') {
      return compareDisabled;
    }
    if (mode === 'slideshow') {
      return slideshowDisabled;
    }
    return false;
  };

  return (
    <View style={styles.row}>
      {MODES.map(mode => {
        const active = value === mode.id;
        const disabled = isDisabled(mode.id);
        return (
          <TouchableOpacity
            key={mode.id}
            style={[styles.tab, active && styles.tabActive, disabled && styles.tabDisabled]}
            onPress={() => !disabled && onChange(mode.id)}
            disabled={disabled}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.tabText,
                active && styles.tabTextActive,
                disabled && styles.tabTextDisabled,
              ]}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: FitTrackColors.surfaceContainer,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: FitTrackColors.primaryContainerMuted,
  },
  tabDisabled: {
    opacity: 0.35,
  },
  tabText: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: FitTrackColors.onSurfaceVariant,
    textAlign: 'center',
  },
  tabTextActive: {
    color: FitTrackColors.primaryContainer,
  },
  tabTextDisabled: {
    color: FitTrackColors.onSurfaceVariant,
  },
});
