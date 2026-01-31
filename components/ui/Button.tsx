import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import { ButtonSize, ButtonVariant, HapticType } from '@/types/common.types';
import React from 'react';
import { TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticType?: HapticType;
  pressScale?: number;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  hapticType = 'light',
  pressScale = 0.95,
}: ButtonProps) {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      opacity: disabled || loading ? 0.5 : 1,
    };

    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      small: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
      medium: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
      large: { paddingHorizontal: 20, paddingVertical: 16, minHeight: 52 },
    };

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: { backgroundColor: colors.accent },
      secondary: { backgroundColor: colors.purpleAccent },
      destructive: { backgroundColor: colors.error },
      ghost: { backgroundColor: 'transparent' },
      outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
    };

    const sizeStyles: Record<ButtonSize, TextStyle> = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    const variantStyles: Record<ButtonVariant, TextStyle> = {
      primary: { color: 'white' },
      secondary: { color: 'white' },
      destructive: { color: 'white' },
      ghost: { color: colors.text },
      outline: { color: colors.text },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const displayTitle = loading ? 'Loading...' : title;

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
        {icon && iconPosition === 'left' && !loading && (
          <IconSymbol 
            name={icon as any} 
            size={size === 'small' ? 16 : size === 'large' ? 20 : 18} 
            color={getTextStyle().color || '#333'} 
            style={{ marginRight: 8 }}
          />
        )}
      <ThemedText style={[getTextStyle(), textStyle]}>
        {displayTitle}
      </ThemedText>
      {icon && iconPosition === 'right' && !loading && (
        <IconSymbol 
          name={icon as any} 
          size={size === 'small' ? 16 : size === 'large' ? 20 : 18} 
          color={getTextStyle().color || '#333'} 
          style={{ marginLeft: 8 }}
        />
      )}
    </TouchableOpacity>
  );
}
