import { CardVariant } from '@/types/common.types';
import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  onPress,
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 16,
    };

    const variantStyles: Record<CardVariant, ViewStyle> = {
      default: {
        backgroundColor: 'white',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      elevated: {
        backgroundColor: 'white',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E0E0E0',
      },
    };

    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      small: { padding: 12 },
      medium: { padding: 16 },
      large: { padding: 24 },
    };

    // If custom style has backgroundColor, don't override it
    const baseCardStyle = {
      ...baseStyle,
      ...variantStyles[variant],
      ...paddingStyles[padding],
    };

    // Remove backgroundColor if it's provided in the style prop
    if (style && 'backgroundColor' in style) {
      delete baseCardStyle.backgroundColor;
    }

    return baseCardStyle;
  };

  // Use TouchableOpacity instead of ThemedView to avoid background color conflicts
  if (onPress) {
    return (
      <TouchableOpacity style={[getCardStyle(), style]} onPress={onPress}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
}
