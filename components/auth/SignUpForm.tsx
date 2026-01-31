import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SignUpFormProps {
  displayName: string;
  email: string;
  password: string;
  loading: boolean;
  onDisplayNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onBackToSignIn: () => void;
}

export function SignUpForm({
  displayName,
  email,
  password,
  loading,
  onDisplayNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onBackToSignIn,
}: SignUpFormProps) {
  return (
    <View style={styles.formSection}>
      <Input
        label="Display name"
        value={displayName}
        onChangeText={onDisplayNameChange}
        placeholder="Your name"
      />
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
        placeholder="Create a password"
        secureTextEntry
      />
      <View style={styles.actionButtons}>
        <Button title="Create account" onPress={onSubmit} loading={loading} />
        <Button title="Back to sign in" onPress={onBackToSignIn} variant="outline" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formSection: {
    gap: 12,
  },
  actionButtons: {
    gap: 12,
  },
});
