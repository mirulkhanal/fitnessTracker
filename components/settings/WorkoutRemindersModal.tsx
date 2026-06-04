import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackSwitch } from '@/components/ui/FitTrackSwitch';
import { WEEKDAY_LABELS, WEEKDAY_ORDER } from '@/constants/workout-days';
import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import type { JsWeekday } from '@/types/workout-schedule.types';
import { formatReminderTime } from '@/utils/workout-schedule-format';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MODAL_SPRING = { damping: 24, stiffness: 280, mass: 0.85 };

export interface WorkoutRemindersModalProps {
  visible: boolean;
  loading: boolean;
  saving: boolean;
  enabled: boolean;
  hour: number;
  minute: number;
  daysOfWeek: JsWeekday[];
  canSave: boolean;
  onClose: () => void;
  onEnabledChange: (value: boolean) => void;
  onToggleDay: (day: JsWeekday) => void;
  onWeekdaysPreset: () => void;
  onEveryDayPreset: () => void;
  onAdjustHour: (delta: number) => void;
  onAdjustMinute: (delta: number) => void;
  onSave: () => Promise<boolean | void>;
}

export function WorkoutRemindersModal({
  visible,
  loading,
  saving,
  enabled,
  hour,
  minute,
  daysOfWeek,
  canSave,
  onClose,
  onEnabledChange,
  onToggleDay,
  onWeekdaysPreset,
  onEveryDayPreset,
  onAdjustHour,
  onAdjustMinute,
  onSave,
}: WorkoutRemindersModalProps) {
  const insets = useSafeAreaInsets();
  const overlayOpacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const cardOpacity = useSharedValue(0);

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

  const handleSavePress = async () => {
    const saved = await onSave();
    if (saved) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss">
          <Animated.View style={[styles.overlay, animatedOverlayStyle]} />
        </Pressable>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.centered, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}
          pointerEvents="box-none"
        >
          <Animated.View style={[styles.cardWrap, animatedCardStyle]}>
            <View style={styles.opaqueCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Workout reminders</Text>
                <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityLabel="Close">
                  <IconSymbol name="xmark.circle.fill" size={28} color={FitTrackColors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator color={FitTrackColors.primaryContainer} />
                </View>
              ) : (
                <ScrollView
                  style={styles.scroll}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.enableRow}>
                    <View style={styles.enableCopy}>
                      <Text style={styles.enableTitle}>Reminders</Text>
                      <Text style={styles.enableSubtitle}>
                        Notify me on workout days to log progress photos
                      </Text>
                    </View>
                    <FitTrackSwitch value={enabled} onValueChange={onEnabledChange} />
                  </View>

                  <Text style={styles.sectionTitle}>Reminder time</Text>
                  <View style={styles.timeCard}>
                    <Text style={styles.timeDisplay}>{formatReminderTime(hour, minute)}</Text>
                    <View style={styles.timeControls}>
                      <View style={styles.timeControlGroup}>
                        <Text style={styles.timeControlLabel}>Hour</Text>
                        <View style={styles.stepperRow}>
                          <StepperButton
                            label="Decrease hour"
                            direction="decrease"
                            onPress={() => onAdjustHour(-1)}
                          />
                          <Text style={styles.stepperValue}>{String(hour).padStart(2, '0')}</Text>
                          <StepperButton
                            label="Increase hour"
                            direction="increase"
                            onPress={() => onAdjustHour(1)}
                          />
                        </View>
                      </View>
                      <View style={styles.timeControlGroup}>
                        <Text style={styles.timeControlLabel}>Minute</Text>
                        <View style={styles.stepperRow}>
                          <StepperButton
                            label="Decrease minute"
                            direction="decrease"
                            onPress={() => onAdjustMinute(-5)}
                          />
                          <Text style={styles.stepperValue}>{String(minute).padStart(2, '0')}</Text>
                          <StepperButton
                            label="Increase minute"
                            direction="increase"
                            onPress={() => onAdjustMinute(5)}
                          />
                        </View>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Workout days</Text>
                  <Text style={styles.sectionHint}>
                    Streaks only count on these days. Rest days (e.g. weekends) will not break your
                    streak.
                  </Text>

                  <View style={styles.presetRow}>
                    <PresetChip label="Mon–Fri" onPress={onWeekdaysPreset} />
                    <PresetChip label="Every day" onPress={onEveryDayPreset} />
                  </View>

                  <View style={styles.dayRow}>
                    {WEEKDAY_ORDER.map(day => {
                      const selected = daysOfWeek.includes(day);
                      return (
                        <TouchableOpacity
                          key={day}
                          style={[styles.dayChip, selected && styles.dayChipSelected]}
                          onPress={() => onToggleDay(day)}
                          activeOpacity={0.85}
                        >
                          <Text
                            style={[styles.dayChipText, selected && styles.dayChipTextSelected]}
                          >
                            {WEEKDAY_LABELS[day]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              )}

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.saveButton, (!canSave || saving || loading) && styles.saveButtonDisabled]}
                  onPress={handleSavePress}
                  disabled={!canSave || saving || loading}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator color={FitTrackColors.primaryContainer} size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save reminders</Text>
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

function StepperButton({
  label,
  onPress,
  direction,
}: {
  label: string;
  onPress: () => void;
  direction: 'decrease' | 'increase';
}) {
  return (
    <TouchableOpacity
      style={styles.stepperButton}
      onPress={onPress}
      accessibilityLabel={label}
      activeOpacity={0.8}
    >
      <IconSymbol
        name={direction === 'decrease' ? 'chevron.left' : 'chevron.right'}
        size={18}
        color={FitTrackColors.primaryContainer}
      />
    </TouchableOpacity>
  );
}

function PresetChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.presetChip} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.presetChipText}>{label}</Text>
    </TouchableOpacity>
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
    maxWidth: 420,
    alignSelf: 'center',
    maxHeight: '92%',
  },
  opaqueCard: {
    flexDirection: 'column',
    backgroundColor: FitTrackColors.surfaceContainerHigh,
    borderRadius: FitTrackRadius.xl,
    borderWidth: 1,
    borderColor: FitTrackColors.surfaceContainerHighest,
    overflow: 'hidden',
    maxHeight: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalTitle: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 22,
    color: FitTrackColors.onBackground,
  },
  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  enableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  enableCopy: {
    flex: 1,
    gap: 4,
  },
  enableTitle: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 16,
    color: FitTrackColors.onSurface,
  },
  enableSubtitle: {
    fontFamily: FitTrackFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: FitTrackColors.onSurfaceVariant,
  },
  sectionTitle: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 15,
    color: FitTrackColors.onSurface,
    marginTop: 4,
  },
  sectionHint: {
    fontFamily: FitTrackFonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: FitTrackColors.onSurfaceVariant,
  },
  timeCard: {
    backgroundColor: FitTrackColors.surfaceContainer,
    borderRadius: FitTrackRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: FitTrackColors.surfaceVariant,
    gap: 12,
  },
  timeDisplay: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 28,
    color: FitTrackColors.primaryContainer,
    textAlign: 'center',
  },
  timeControls: {
    flexDirection: 'row',
    gap: 12,
  },
  timeControlGroup: {
    flex: 1,
    gap: 8,
  },
  timeControlLabel: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: FitTrackColors.onSurfaceVariant,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FitTrackColors.primaryContainerMuted,
    borderWidth: 1,
    borderColor: FitTrackColors.primaryContainerBorder,
  },
  stepperValue: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 18,
    color: FitTrackColors.onSurface,
    minWidth: 36,
    textAlign: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: FitTrackRadius.lg,
    backgroundColor: FitTrackColors.surfaceContainer,
    borderWidth: 1,
    borderColor: FitTrackColors.surfaceVariant,
  },
  presetChipText: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 14,
    color: FitTrackColors.primaryContainer,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  dayChip: {
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: FitTrackRadius.lg,
    alignItems: 'center',
    backgroundColor: FitTrackColors.surfaceContainer,
    borderWidth: 1,
    borderColor: FitTrackColors.surfaceVariant,
  },
  dayChipSelected: {
    backgroundColor: FitTrackColors.primaryContainerMuted,
    borderColor: FitTrackColors.primaryContainerBorder,
  },
  dayChipText: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 14,
    color: FitTrackColors.onSurfaceVariant,
  },
  dayChipTextSelected: {
    color: FitTrackColors.primaryContainer,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
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
