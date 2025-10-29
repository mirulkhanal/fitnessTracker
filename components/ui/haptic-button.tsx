import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Animated, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface HapticButtonProps extends TouchableOpacityProps {
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  pressScale?: number;
  children: React.ReactNode;
}

export function HapticButton({ 
  hapticType = 'light', 
  pressScale = 0.95,
  children, 
  onPressIn,
  onPressOut,
  style,
  ...props 
}: HapticButtonProps) {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = (event: any) => {
    // Haptic feedback
    if (process.env.EXPO_OS === 'ios') {
      switch (hapticType) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    }

    // Visual press effect
    Animated.spring(scaleValue, {
      toValue: pressScale,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();

    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    // Visual release effect
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();

    onPressOut?.(event);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={style}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

