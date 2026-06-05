import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface DeleteAccountPasswordModalProps {
  visible: boolean;
  deleting: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export function DeleteAccountPasswordModal({
  visible,
  deleting,
  onClose,
  onConfirm,
}: DeleteAccountPasswordModalProps) {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!visible) {
      setPassword('');
    }
  }, [visible]);

  const canConfirm = password.length > 0 && !deleting;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={deleting ? undefined : onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <Pressable style={[styles.card, { marginBottom: insets.bottom + 16 }]} onPress={() => {}}>
            <Text style={styles.title}>Confirm password</Text>
            <Text style={styles.message}>
              Enter your account password to permanently delete your FitTrack account and all cloud
              data.
            </Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={FitTrackColors.onSurfaceVariant}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!deleting}
            />
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={deleting}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, !canConfirm && styles.deleteButtonDisabled]}
                onPress={() => onConfirm(password)}
                disabled={!canConfirm}
                activeOpacity={0.85}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.deleteText}>Delete account</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  keyboard: {
    width: '100%',
  },
  card: {
    backgroundColor: FitTrackColors.surface,
    borderRadius: FitTrackRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 20,
    color: FitTrackColors.onBackground,
    marginBottom: 8,
  },
  message: {
    fontFamily: FitTrackFonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: FitTrackColors.onSurfaceVariant,
    marginBottom: 16,
  },
  input: {
    fontFamily: FitTrackFonts.body,
    fontSize: 16,
    color: FitTrackColors.onBackground,
    backgroundColor: FitTrackColors.background,
    borderRadius: FitTrackRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: FitTrackRadius.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  cancelText: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 15,
    color: FitTrackColors.onBackground,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: FitTrackRadius.md,
    alignItems: 'center',
    backgroundColor: '#C62828',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteText: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
