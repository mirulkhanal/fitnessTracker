import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SignInEmailFormProps {
  email: string;
  password: string;
  loading: boolean;
  biometricEnabled?: boolean;
  biometricLabel?: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onBiometricSignIn?: () => void;
  onCreateAccount: () => void;
  onForgotPassword: () => void;
}

export function SignInEmailForm({
  email,
  password,
  loading,
  biometricEnabled = false,
  biometricLabel = 'Biometrics',
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onBiometricSignIn,
  onCreateAccount,
  onForgotPassword,
}: SignInEmailFormProps) {
  return (
    <View style={styles.formSection}>
      {biometricEnabled && onBiometricSignIn ? (
        <Button
          title={`Sign in with ${biometricLabel}`}
          onPress={onBiometricSignIn}
          loading={loading}
          variant="outline"
        />
      ) : null}
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
        <Button title="Sign in" onPress={onSubmit} loading={loading} />
        <Button title="Forgot password?" onPress={onForgotPassword} variant="outline" />
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
