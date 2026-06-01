import { AuthTitle } from '@/components/auth/AuthTitle';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useSignupSuccess } from '@/hooks/use-signup-success';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function SignupSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';
  const { loading, handleResend } = useSignupSuccess(email);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <AuthTitle title="Check your email" />
        <ThemedText style={styles.subtitle}>
          We sent a confirmation link to your inbox. Open it on this device to finish setting up
          your account.
        </ThemedText>
        <View style={styles.actions}>
          {email ? (
            <Button title="Resend verification email" onPress={handleResend} loading={loading} variant="outline" />
          ) : null}
          <Button title="Back to sign in" onPress={() => router.replace('/sign-in')} />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    gap: 16,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.75,
  },
  actions: {
    marginTop: 8,
    width: '100%',
    gap: 12,
  },
});
