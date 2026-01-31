import { HapticButton } from '@/components/ui/haptic-button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring
} from 'react-native-reanimated';

interface AnimatedAddButtonProps {
  onPress: () => void;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  pressScale?: number;
  style?: any;
  iconName?: string;
  iconSize?: number;
}

export const AnimatedAddButton: React.FC<AnimatedAddButtonProps> = ({
  onPress,
  hapticType = 'medium',
  pressScale = 0.9,
  style,
  iconName = 'plus',
  iconSize = 28,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'] as any;

  const scale = useSharedValue(0.8);
  const rotation = useSharedValue(0);

  // Subtle entrance animation
  useEffect(() => {
    scale.value = withDelay(200, withSpring(1, {
      damping: 15,
      stiffness: 150,
      mass: 1,
    }));
  }, [scale]);

  const handlePressIn = () => {
    scale.value = withSpring(pressScale, {
      damping: 20,
      stiffness: 200,
      mass: 1.2,
    });
    rotation.value = withSpring(15, {
      damping: 20,
      stiffness: 200,
      mass: 1.2,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 20,
      stiffness: 200,
      mass: 1.2,
    });
    rotation.value = withSpring(0, {
      damping: 20,
      stiffness: 200,
      mass: 1.2,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <HapticButton
        style={[styles.fab, { backgroundColor: colors.accent }, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hapticType={hapticType}
        pressScale={1} // We handle scaling with our own animation
      >
        <IconSymbol name={iconName as any} size={iconSize} color="white" />
      </HapticButton>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
});
