import { AuthTitle } from '@/components/auth/AuthTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useForgotPasswordForm } from '@/hooks/use-forgot-password-form';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const { email, loading, sent, setEmail, handleSubmit, goBack } = useForgotPasswordForm();

  return (
    <ThemedView style={styles.container}>
      <AuthTitle title="Forgot password" />
      {sent ? (
        <View style={styles.card}>
          <ThemedText style={styles.subtitle}>
            If an account exists for that email, we sent reset instructions. Open the link on this
            device to choose a new password.
          </ThemedText>
          <Button title="Back to sign in" onPress={goBack} />
        </View>
      ) : (
        <View style={styles.card}>
          <ThemedText style={styles.subtitle}>
            Enter your account email and we will send a reset link.
          </ThemedText>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />
          <Button title="Send reset link" onPress={handleSubmit} loading={loading} />
          <Button title="Back to sign in" onPress={goBack} variant="outline" />
        </View>
      )}
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
  card: {
    gap: 12,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.75,
  },
});
