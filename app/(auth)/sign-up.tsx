import { AuthTitle } from '@/components/auth/AuthTitle';
import { SignUpAvatarPicker } from '@/components/auth/SignUpAvatarPicker';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ThemedView } from '@/components/ui/themed-view';
import { useSignUpForm } from '@/hooks/use-sign-up-form';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const {
    displayName,
    avatarUri,
    email,
    password,
    loading,
    setDisplayName,
    setEmail,
    setPassword,
    handlePickAvatar,
    handleEmailSignUp,
  } = useSignUpForm();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AuthTitle title="Create account" />
        <SignUpAvatarPicker avatarUri={avatarUri} onPickAvatar={handlePickAvatar} />
        <SignUpForm
          displayName={displayName}
          email={email}
          password={password}
          loading={loading}
          onDisplayNameChange={setDisplayName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleEmailSignUp}
          onBackToSignIn={() => router.replace('/sign-in')}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
});
