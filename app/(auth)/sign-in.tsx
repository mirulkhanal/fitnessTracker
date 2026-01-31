import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthTitle } from '@/components/auth/AuthTitle';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { SignInEmailForm } from '@/components/auth/SignInEmailForm';
import { ThemedView } from '@/components/ui/themed-view';
import { useSignInForm } from '@/hooks/use-sign-in-form';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { StyleSheet } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const {
    email,
    password,
    loading,
    setEmail,
    setPassword,
    handleEmailSignIn,
    handleOAuth,
  } = useSignInForm();

  return (
    <ThemedView style={styles.container}>
      <AuthTitle title="Sign in" />
      <SignInEmailForm
        email={email}
        password={password}
        loading={loading}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleEmailSignIn}
        onCreateAccount={() => router.push('/sign-up')}
      />
      <AuthDivider />
      <OAuthButtons loading={loading} onGooglePress={() => handleOAuth('google')} />
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
