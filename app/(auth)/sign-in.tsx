import { AuthTitle } from '@/components/auth/AuthTitle';
import { SignInEmailForm } from '@/components/auth/SignInEmailForm';
import { ThemedView } from '@/components/ui/themed-view';
import { useSignInForm } from '@/hooks/use-sign-in-form';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function SignInScreen() {
  const router = useRouter();
  const {
    email,
    password,
    loading,
    biometricEnabled,
    biometricLabel,
    setEmail,
    setPassword,
    handleEmailSignIn,
    handleBiometricSignIn,
  } = useSignInForm();

  return (
    <ThemedView style={styles.container}>
      <AuthTitle title="Sign in" />
      <SignInEmailForm
        email={email}
        password={password}
        loading={loading}
        biometricEnabled={biometricEnabled}
        biometricLabel={biometricLabel}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleEmailSignIn}
        onBiometricSignIn={handleBiometricSignIn}
        onCreateAccount={() => router.push('/sign-up')}
        onForgotPassword={() => router.push('/forgot-password')}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 16,
  },
});
