import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { height: screenHeight } = Dimensions.get('window');

interface AnimatedModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  options: {
    id: string;
    title: string;
    description: string;
    icon: string;
    iconColor: string;
    backgroundColor: string;
    onPress: () => void;
  }[];
  cancelText?: string;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  options,
  cancelText = 'Cancel',
}) => {
  const { colors } = useTheme();

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Start from below screen
      translateY.value = screenHeight * 0.3;
      scale.value = 0.9;
      opacity.value = 0;
      overlayOpacity.value = 0;

      // Animate everything together smoothly
      overlayOpacity.value = withTiming(1, { duration: 150 });
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 400,
        mass: 0.6,
      });
      scale.value = withSpring(1, {
        damping: 25,
        stiffness: 400,
        mass: 0.6,
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      // Animate out smoothly
      translateY.value = withTiming(screenHeight * 0.3, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
      opacity.value = withTiming(0, { duration: 150 });
      overlayOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [opacity, overlayOpacity, scale, translateY, visible]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
        <Animated.View style={[styles.modalContainer, { backgroundColor: colors.cardBackground }, animatedModalStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="chevron.right" size={24} color={colors.icon} />
            </TouchableOpacity>
          </View>

          {/* Subtitle */}
          <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.optionButton, { backgroundColor: option.backgroundColor }]}
                onPress={option.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.iconColor }]}>
                  <IconSymbol name={option.icon as any} size={28} color="white" />
                </View>
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionTitle}>{option.title}</ThemedText>
                  <ThemedText style={styles.optionDescription}>{option.description}</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.icon} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.cardBackground, borderColor: colors.icon }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.cancelButtonText}>{cancelText}</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 24,
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
