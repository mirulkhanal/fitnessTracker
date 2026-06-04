import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeFabProps {
  onPress: () => void;
  /** Distance above the safe-area bottom edge. Use a smaller value when there is no tab bar. */
  bottomOffset?: number;
}

const TAB_BAR_CLEARANCE = 88;

export function HomeFab({ onPress, bottomOffset = TAB_BAR_CLEARANCE }: HomeFabProps) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 18, stiffness: 320 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
  };

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.wrap,
        { bottom: bottomOffset + insets.bottom },
        animatedStyle,
      ]}
    >
      <View style={styles.glow} />
      <Pressable
        style={styles.fab}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel="Add progress photo"
      >
        <Text style={styles.plus}>+</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 24,
    zIndex: 40,
  },
  glow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: FitTrackRadius.fab,
    backgroundColor: FitTrackColors.fabGlow,
    top: -4,
    left: -4,
    opacity: 0.6,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: FitTrackRadius.fab,
    backgroundColor: FitTrackColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: FitTrackColors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  plus: {
    fontFamily: FitTrackFonts.display,
    fontSize: 32,
    lineHeight: 34,
    color: FitTrackColors.onPrimaryContainer,
    marginTop: -2,
  },
});
