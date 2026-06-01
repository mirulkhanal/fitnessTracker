import { CategoryForm } from '@/components/forms/CategoryForm';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { CreateCategoryRequest } from '@/types/category.types';
import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

interface CategoryFormModalProps {
  visible: boolean;
  loading: boolean;
  initialName?: string;
  initialIcon?: string;
  initialColor?: string;
  onClose: () => void;
  onSubmit: (request: CreateCategoryRequest) => void;
  onCancel: () => void;
}

const MODAL_SPRING = { damping: 24, stiffness: 280, mass: 0.85 };

export function CategoryFormModal({
  visible,
  loading,
  initialName,
  initialIcon,
  initialColor,
  onClose,
  onSubmit,
  onCancel,
}: CategoryFormModalProps) {
  const overlayOpacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const cardOpacity = useSharedValue(0);

  const formKey = initialName?.trim()
    ? `edit-${initialName}-${initialIcon}-${initialColor}`
    : 'new';

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 220 });
      scale.value = withSpring(1, MODAL_SPRING);
      cardOpacity.value = withTiming(1, { duration: 200 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 180 });
      scale.value = withTiming(0.92, { duration: 200 });
      cardOpacity.value = withTiming(0, { duration: 160 });
    }
  }, [cardOpacity, overlayOpacity, scale, visible]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss">
          <Animated.View style={[styles.overlay, animatedOverlayStyle]} />
        </Pressable>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.centered}
          pointerEvents="box-none"
        >
          <Animated.View style={[styles.cardWrap, animatedCardStyle]}>
            <GlassPanel style={styles.glassCard}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <CategoryForm
                  key={visible ? formKey : 'hidden'}
                  variant="fittrack"
                  onSubmit={onSubmit}
                  onCancel={onCancel}
                  loading={loading}
                  initialName={initialName}
                  initialIcon={initialIcon}
                  initialColor={initialColor}
                />
              </ScrollView>
            </GlassPanel>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 20, 36, 0.88)',
  },
  centered: {
    width: '100%',
    maxWidth: 420,
  },
  cardWrap: {
    width: '100%',
    maxHeight: '88%',
  },
  glassCard: {
    borderRadius: 16,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
});
