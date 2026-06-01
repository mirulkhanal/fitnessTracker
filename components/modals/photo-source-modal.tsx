import { GlassPanel } from '@/components/ui/GlassPanel';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PhotoSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  title?: string;
  subtitle?: string;
}

const SHEET_SPRING = { damping: 28, stiffness: 320, mass: 0.8 };

interface SourceOptionProps {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  iconBackgroundColor: string;
  iconColor: string;
  onPress: () => void;
}

function SourceOption({
  title,
  description,
  icon,
  iconBackgroundColor,
  iconColor,
  onPress,
}: SourceOptionProps) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress}>
      <GlassPanel style={styles.optionCard}>
        <View style={styles.optionRow}>
          <View style={[styles.iconBox, { backgroundColor: iconBackgroundColor }]}>
            <IconSymbol name={icon} size={26} color={iconColor} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionDescription}>{description}</Text>
          </View>
          <IconSymbol name="chevron.right" size={22} color={FitTrackColors.onSurfaceVariant} />
        </View>
      </GlassPanel>
    </TouchableOpacity>
  );
}

export function PhotoSourceModal({
  visible,
  onClose,
  onCamera,
  onGallery,
  title = 'Add Progress Photo',
  subtitle = 'Choose how you want to add a photo',
}: PhotoSourceModalProps) {
  const insets = useSafeAreaInsets();
  const overlayOpacity = useSharedValue(0);
  const translateY = useSharedValue(500);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 220 });
      translateY.value = withSpring(0, SHEET_SPRING);
    } else {
      overlayOpacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(500, { duration: 240 });
    }
  }, [overlayOpacity, translateY, visible]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss">
          <Animated.View style={[styles.overlay, animatedOverlayStyle]} />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 20),
            },
            animatedSheetStyle,
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.options}>
            <SourceOption
              title="Camera"
              description="Take a new photo"
              icon="camera.fill"
              iconBackgroundColor={FitTrackColors.primaryContainerMuted}
              iconColor={FitTrackColors.primaryContainer}
              onPress={onCamera}
            />
            <SourceOption
              title="Gallery"
              description="Choose from photos"
              icon="folder.fill"
              iconBackgroundColor={FitTrackColors.surfaceContainerHighest}
              iconColor={FitTrackColors.onSecondaryContainer}
              onPress={onGallery}
            />
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 20, 36, 0.82)',
  },
  sheet: {
    backgroundColor: FitTrackColors.surfaceContainer,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(195, 201, 178, 0.4)',
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 24,
    lineHeight: 32,
    color: FitTrackColors.onBackground,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FitTrackFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: FitTrackColors.onSurfaceVariant,
  },
  options: {
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    borderRadius: FitTrackRadius.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: FitTrackRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 20,
    lineHeight: 26,
    color: FitTrackColors.onBackground,
    marginBottom: 4,
  },
  optionDescription: {
    fontFamily: FitTrackFonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: FitTrackColors.onSurfaceVariant,
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: FitTrackRadius.lg,
    borderWidth: 1,
    borderColor: FitTrackColors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  cancelText: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 14,
    letterSpacing: 2.8,
    color: FitTrackColors.onBackground,
  },
});
