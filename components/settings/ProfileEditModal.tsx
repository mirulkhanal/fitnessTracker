import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import { Image } from 'expo-image';
import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MODAL_SPRING = { damping: 24, stiffness: 280, mass: 0.85 };

export interface ProfileEditModalProps {
  visible: boolean;
  email: string;
  displayName: string;
  bio: string;
  avatarUri: string | null;
  saving: boolean;
  canSave: boolean;
  onDisplayNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onPickAvatar: () => void;
  onSave: () => void;
  onClose: () => void;
}

export function ProfileEditModal({
  visible,
  email,
  displayName,
  bio,
  avatarUri,
  saving,
  canSave,
  onDisplayNameChange,
  onBioChange,
  onPickAvatar,
  onSave,
  onClose,
}: ProfileEditModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const overlayOpacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const cardOpacity = useSharedValue(0);
  const avatarSource = useAuthenticatedImageSource(avatarUri);
  const fallbackName =
    displayName.trim() || (email.includes('@') ? email.split('@')[0] : 'Profile');

  const maxCardHeight = useMemo(
    () => windowHeight - insets.top - insets.bottom - 48,
    [insets.bottom, insets.top, windowHeight],
  );

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
          style={[
            styles.centered,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
          ]}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[styles.cardWrap, { maxHeight: maxCardHeight }, animatedCardStyle]}
          >
            <View style={styles.opaqueCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit profile</Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={12}
                  accessibilityLabel="Close"
                  activeOpacity={0.7}
                >
                  <IconSymbol name="xmark.circle.fill" size={28} color={FitTrackColors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
                nestedScrollEnabled
              >
                <View style={styles.profileRow}>
                  <TouchableOpacity
                    style={styles.avatar}
                    onPress={onPickAvatar}
                    activeOpacity={0.85}
                  >
                    {avatarSource ? (
                      <Image source={avatarSource} style={styles.avatarImage} contentFit="cover" />
                    ) : (
                      <Text style={styles.avatarFallback}>
                        {fallbackName.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.profileMeta}>
                    <Text style={styles.profileEmail}>{email}</Text>
                    <TouchableOpacity onPress={onPickAvatar} activeOpacity={0.7}>
                      <Text style={styles.changePhoto}>Change photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Display name</Text>
                  <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={onDisplayNameChange}
                    placeholder="Your name"
                    placeholderTextColor="rgba(195, 201, 178, 0.5)"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Bio</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    value={bio}
                    onChangeText={onBioChange}
                    placeholder="A short note about you"
                    placeholderTextColor="rgba(195, 201, 178, 0.5)"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.saveButton, (!canSave || saving) && styles.saveButtonDisabled]}
                  onPress={onSave}
                  disabled={!canSave || saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator color={FitTrackColors.primaryContainer} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save profile</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
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
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 20, 36, 0.94)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  opaqueCard: {
    flexDirection: 'column',
    backgroundColor: FitTrackColors.surfaceContainerHigh,
    borderRadius: FitTrackRadius.xl,
    borderWidth: 1,
    borderColor: FitTrackColors.surfaceContainerHighest,
    overflow: 'hidden',
    maxHeight: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalTitle: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 22,
    color: FitTrackColors.onBackground,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: FitTrackColors.surfaceContainerHighest,
    backgroundColor: FitTrackColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 24,
    color: FitTrackColors.onSecondaryContainer,
  },
  profileMeta: {
    flex: 1,
  },
  profileEmail: {
    fontFamily: FitTrackFonts.body,
    fontSize: 15,
    color: FitTrackColors.onSurfaceVariant,
    marginBottom: 4,
  },
  changePhoto: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 14,
    color: FitTrackColors.primaryContainer,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 14,
    color: FitTrackColors.onSurface,
  },
  input: {
    fontFamily: FitTrackFonts.body,
    fontSize: 16,
    color: FitTrackColors.onSurface,
    backgroundColor: FitTrackColors.surfaceContainer,
    borderRadius: FitTrackRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: FitTrackColors.surfaceVariant,
  },
  inputMultiline: {
    minHeight: 88,
    paddingTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: FitTrackColors.surfaceContainerHigh,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: FitTrackRadius.lg,
    alignItems: 'center',
    backgroundColor: FitTrackColors.primaryContainerMuted,
    borderWidth: 1,
    borderColor: FitTrackColors.primaryContainerBorder,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 15,
    color: FitTrackColors.primaryContainer,
  },
});
