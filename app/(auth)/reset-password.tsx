import { AuthTitle } from '@/components/auth/AuthTitle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useResetPasswordForm } from '@/hooks/use-reset-password-form';
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(typeof params.token === 'string' ? params.token : '');

  useEffect(() => {
    if (token) {
      return;
    }
    const loadToken = async () => {
      const url = await Linking.getInitialURL();
      if (!url) {
        return;
      }
      const parsed = Linking.parse(url);
      const value = parsed.queryParams?.token;
      if (typeof value === 'string') {
        setToken(value);
      }
    };
    void loadToken();
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const parsed = Linking.parse(url);
      const value = parsed.queryParams?.token;
      if (typeof value === 'string') {
        setToken(value);
      }
    });
    return () => subscription.remove();
  }, [token]);

  const { password, confirmPassword, loading, setPassword, setConfirmPassword, handleSubmit } =
    useResetPasswordForm(token);

  return (
    <ThemedView style={styles.container}>
      <AuthTitle title="New password" />
      <View style={styles.card}>
        {!token ? (
          <ThemedText style={styles.subtitle}>
            Open the reset link from your email on this device to continue.
          </ThemedText>
        ) : (
          <>
            <ThemedText style={styles.subtitle}>Choose a new password for your account.</ThemedText>
            <Input
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              secureTextEntry
            />
            <Input
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat password"
              secureTextEntry
            />
            <Button title="Update password" onPress={handleSubmit} loading={loading} />
          </>
        )}
      </View>
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
