import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ui/themed-text';

interface SignUpAvatarPickerProps {
  avatarUri: string | null;
  onPickAvatar: () => void;
}

export function SignUpAvatarPicker({ avatarUri, onPickAvatar }: SignUpAvatarPickerProps) {
  return (
    <View style={styles.avatarSection}>
      <TouchableOpacity style={styles.avatarButton} onPress={onPickAvatar} activeOpacity={0.8}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <ThemedText style={styles.avatarPlaceholder}>Add photo</ThemedText>
        )}
      </TouchableOpacity>
      <ThemedText style={styles.avatarHint}>Display picture optional</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    gap: 8,
  },
  avatarButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    fontSize: 14,
    opacity: 0.7,
  },
  avatarHint: {
    fontSize: 12,
    opacity: 0.6,
  },
});
