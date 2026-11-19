import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import { useAppLock } from '@/contexts/AppLockContext';
import { useLocalProfile } from '@/contexts/LocalProfileContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { profile, saveProfile } = useLocalProfile();
  const { fitTrackColors } = useTheme();
  const { runWithLockSuspended } = useAppLock();
  const [name, setName] = useState(profile.display_name);
  const [avatarUri, setAvatarUri] = useState<string | null>(profile.avatar_url);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Allow photo library access to choose a profile image.');
      return;
    }
    await runWithLockSuspended(async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) setAvatarUri(result.assets[0].uri);
    });
  };

  const continueToApp = async () => {
    if (!name.trim()) {
      setError('Enter your full name to continue.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveProfile({ display_name: name.trim(), avatar_url: avatarUri }, true);
      router.replace('/(tabs)');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile on this device.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.page, { backgroundColor: fitTrackColors.background }]} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <Text style={[styles.brand, { color: fitTrackColors.primaryContainer }]}>FITTRACK</Text>
        <Text style={[styles.title, { color: fitTrackColors.onBackground }]}>Set up your profile</Text>
        <Text style={[styles.subtitle, { color: fitTrackColors.onSurfaceVariant }]}>This is a profile on this device only. There is no account, email, or password.</Text>

        <TouchableOpacity style={[styles.avatar, {
          backgroundColor: fitTrackColors.surfaceContainerHigh,
          borderColor: fitTrackColors.outlineVariant,
        }]} onPress={() => void pickPhoto()} activeOpacity={0.8} accessibilityLabel="Choose profile photo">
          {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" /> : (
            <IconSymbol name="camera.fill" size={30} color={fitTrackColors.onSurfaceVariant} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => void pickPhoto()} style={styles.photoButton}>
          <Text style={[styles.photoButtonText, { color: fitTrackColors.primaryContainer }]}>{avatarUri ? 'Change photo' : 'Add a photo (optional)'}</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: fitTrackColors.onSurfaceVariant }]}>Full name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          placeholderTextColor={`${fitTrackColors.onSurfaceVariant}80`}
          autoCapitalize="words"
          returnKeyType="done"
          style={[styles.input, {
            color: fitTrackColors.onBackground,
            backgroundColor: fitTrackColors.surfaceContainer,
            borderColor: fitTrackColors.outlineVariant,
          }]}
        />
        {error ? <Text style={[styles.error, { color: fitTrackColors.error }]}>{error}</Text> : null}
        <TouchableOpacity style={[styles.continueButton, { backgroundColor: fitTrackColors.primaryContainer }]} onPress={() => void continueToApp()} disabled={saving}>
          {saving ? <ActivityIndicator color={fitTrackColors.onPrimaryContainer} /> : <Text style={[styles.continueText, { color: fitTrackColors.onPrimaryContainer }]}>Continue</Text>}
        </TouchableOpacity>
        <Text style={[styles.storageNote, { color: fitTrackColors.onSurfaceVariant }]}>Your profile, categories, and progress photos are kept in this app on this device.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, backgroundColor: FitTrackColors.background, justifyContent: 'center', padding: 24 },
  content: { width: '100%', maxWidth: 440, alignSelf: 'center', alignItems: 'center' },
  brand: { color: FitTrackColors.primaryContainer, fontFamily: FitTrackFonts.displaySemi, fontSize: 15, letterSpacing: 2, marginBottom: 18 },
  title: { color: FitTrackColors.onBackground, fontFamily: FitTrackFonts.displaySemi, fontSize: 30, textAlign: 'center', marginBottom: 10 },
  subtitle: { color: FitTrackColors.onSurfaceVariant, fontFamily: FitTrackFonts.body, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 30 },
  avatar: { width: 104, height: 104, borderRadius: 52, backgroundColor: FitTrackColors.surfaceContainerHigh, borderWidth: 1, borderColor: FitTrackColors.outlineVariant, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  photoButton: { padding: 12, marginBottom: 18 },
  photoButtonText: { color: FitTrackColors.primaryContainer, fontFamily: FitTrackFonts.body, fontSize: 14 },
  label: { alignSelf: 'stretch', color: FitTrackColors.onSurfaceVariant, fontFamily: FitTrackFonts.body, fontSize: 13, marginBottom: 8 },
  input: { alignSelf: 'stretch', borderRadius: FitTrackRadius.lg, borderWidth: 1, borderColor: FitTrackColors.outlineVariant, backgroundColor: FitTrackColors.surfaceContainer, color: FitTrackColors.onBackground, fontFamily: FitTrackFonts.body, fontSize: 16, paddingHorizontal: 16, paddingVertical: 14 },
  error: { alignSelf: 'stretch', color: '#FFB4AB', fontFamily: FitTrackFonts.body, marginTop: 10 },
  continueButton: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', minHeight: 52, marginTop: 22, borderRadius: 26, backgroundColor: FitTrackColors.primaryContainer },
  continueText: { color: FitTrackColors.background, fontFamily: FitTrackFonts.displaySemi, fontSize: 16 },
  storageNote: { color: FitTrackColors.onSurfaceVariant, fontFamily: FitTrackFonts.body, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 18 },
});
