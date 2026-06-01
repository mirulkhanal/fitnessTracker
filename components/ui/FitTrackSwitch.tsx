import { FitTrackColors } from '@/constants/fittrack-theme';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface FitTrackSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function FitTrackSwitch({ value, onValueChange, disabled = false }: FitTrackSwitchProps) {
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(value ? 22 : 2, { duration: 200 }) }],
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={[styles.track, value && styles.trackOn, disabled && styles.trackDisabled]}
    >
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: FitTrackColors.surfaceContainerHighest,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: FitTrackColors.primaryContainer,
  },
  trackDisabled: {
    opacity: 0.5,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: FitTrackColors.surface,
  },
});
