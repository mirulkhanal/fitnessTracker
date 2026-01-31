import { AuthTitle } from '@/components/auth/AuthTitle';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function SignupSuccessScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <AuthTitle title="Check your email" />
        <ThemedText style={styles.subtitle}>
          We sent a confirmation link to your inbox. Open it to finish setting up your account.
        </ThemedText>
        <View style={styles.actions}>
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
  },
});
