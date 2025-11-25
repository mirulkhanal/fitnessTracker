import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeOpen?: () => void;
  onSwipeClose?: () => void;
  deleteAction?: React.ReactNode;
  swipeThreshold?: number;
}

export function SwipeableCard({
  children,
  onSwipeOpen,
  onSwipeClose,
  deleteAction,
  swipeThreshold = 70,
}: SwipeableCardProps) {
  const translateX = useSharedValue(0);
  const [isSwiped, setIsSwiped] = React.useState(false);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        const clampedValue = Math.max(e.translationX, -swipeThreshold);
        translateX.value = clampedValue;
      }
    })
    .onEnd((e) => {
      if (e.translationX < -swipeThreshold / 2) {
        translateX.value = withSpring(-swipeThreshold);
        setIsSwiped(true);
        onSwipeOpen?.();
      } else {
        translateX.value = withSpring(0);
        setIsSwiped(false);
        onSwipeClose?.();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      {deleteAction && (
        <Animated.View style={[styles.deleteContainer, animatedStyle]}>
          {deleteAction}
        </Animated.View>
      )}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  deleteContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

