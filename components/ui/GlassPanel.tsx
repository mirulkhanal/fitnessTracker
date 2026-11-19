import { FitTrackRadius } from '@/constants/fittrack-theme';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface GlassPanelProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  active?: boolean;
}

export function GlassPanel({ children, style, contentStyle, active = false }: GlassPanelProps) {
  const { fitTrackColors, isDarkMode } = useTheme();
  const fill = active ? fitTrackColors.glassFillActive : fitTrackColors.glassFill;

  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.panel,
          {
            backgroundColor: fill,
            borderColor: fitTrackColors.glassBorder,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={50} tint={isDarkMode ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View
        style={[
          styles.panel,
          styles.panelOverlay,
          {
            backgroundColor: fill,
            borderColor: fitTrackColors.glassBorder,
            borderTopColor: fitTrackColors.glassBorderHighlight,
          },
        ]}
      />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: FitTrackRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  panel: {
    borderRadius: FitTrackRadius.lg,
    borderWidth: 1,
  },
  panelOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
