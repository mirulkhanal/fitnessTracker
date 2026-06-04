import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';

interface SignInEmailFormProps {
  email: string;
  password: string;
  loading: boolean;
  unlockOnly?: boolean;
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
  unlockOnly = false,
  biometricEnabled = false,
  biometricLabel = 'Biometrics',
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onBiometricSignIn,
  onCreateAccount,
  onForgotPassword,
}: SignInEmailFormProps) {
  const { colors } = useTheme();
  const showBiometricButton = biometricEnabled && Boolean(onBiometricSignIn);

  if (unlockOnly) {
    return (
      <View style={styles.formSection}>
        {showBiometricButton ? (
          <TouchableOpacity
            style={[styles.biometricUnlock, { borderColor: colors.border }]}
            onPress={onBiometricSignIn}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={`Unlock with ${biometricLabel}`}
            activeOpacity={0.8}
          >
            <IconSymbol name="touchid" size={40} color={colors.accent} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

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
        <View style={styles.signInRow}>
          <Button
            title="Sign in"
            onPress={onSubmit}
            loading={loading}
            style={styles.signInButton}
          />
          {showBiometricButton ? (
            <TouchableOpacity
              style={[styles.biometricButton, { borderColor: colors.border }]}
              onPress={onBiometricSignIn}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={`Sign in with ${biometricLabel}`}
              activeOpacity={0.8}
            >
              <IconSymbol name="touchid" size={28} color={colors.accent} />
            </TouchableOpacity>
          ) : null}
        </View>
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
  signInRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  signInButton: {
    flex: 1,
  },
  biometricButton: {
    width: 52,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricUnlock: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
