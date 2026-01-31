import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SignInEmailFormProps {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onCreateAccount: () => void;
}

export function SignInEmailForm({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onCreateAccount,
}: SignInEmailFormProps) {
  return (
    <View style={styles.formSection}>
      <Input
        label="Email"
        value={email}
        onChangeText={onEmailChange}
        placeholder="you@example.com"
        keyboardType="email-address"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={onPasswordChange}
        placeholder="Enter your password"
        secureTextEntry
      />
      <View style={styles.emailButtons}>
        <Button title="Sign in with Email" onPress={onSubmit} loading={loading} />
        <Button title="Create account" onPress={onCreateAccount} variant="outline" loading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formSection: {
    gap: 12,
  },
  emailButtons: {
    gap: 12,
  },
});
