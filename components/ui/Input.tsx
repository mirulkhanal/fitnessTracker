import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, TextInput, TextStyle, View, ViewStyle } from 'react-native';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  returnKeyType?: 'done' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style,
  textStyle,
  autoFocus = false,
  secureTextEntry = false,
  keyboardType = 'default',
  returnKeyType = 'done',
  onSubmitEditing,
}: InputProps) {
  const { colors } = useTheme();

  const getInputStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.cardBackground,
      opacity: disabled ? 0.5 : 1,
    };

    const multilineStyle: ViewStyle = multiline ? {
      minHeight: numberOfLines * 20 + 24,
    } : {};

    const errorStyle: ViewStyle = error ? {
      borderColor: colors.pinkAccent,
    } : {
      borderColor: colors.icon + '40',
    };

    return {
      ...baseStyle,
      ...multilineStyle,
      ...errorStyle,
    };
  };

  const getTextStyle = (): TextStyle => {
    return {
      fontSize: 16,
      color: colors.text,
      textAlignVertical: multiline ? 'top' : 'center',
    };
  };

  return (
    <>
      {label && (
        <ThemedText style={styles.label}>
          {label}
        </ThemedText>
      )}
      <View style={[getInputStyle(), style]}>
        <TextInput
          style={[getTextStyle(), textStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.icon}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoFocus={autoFocus}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
      </View>
      {error && (
        <ThemedText style={[styles.error, { color: colors.pinkAccent }]}>
          {error}
        </ThemedText>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  error: {
    fontSize: 14,
    marginTop: 4,
  },
});
