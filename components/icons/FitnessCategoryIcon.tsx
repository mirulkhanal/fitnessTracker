import { customIcons } from '@/components/icons/custom-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type Props = {
  iconId: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
};

/**
 * Renders fitness category SVG icons. Kept separate from IconSymbol so the main
 * bundle does not pull in every gym SVG for tab/navigation icons.
 */
export function FitnessCategoryIcon({ iconId, size = 24, color, style }: Props) {
  const Custom = customIcons[iconId];
  if (Custom) {
    const strokeColor = typeof color === 'string' ? color : '#FFFFFF';
    return (
      <Custom
        width={size}
        height={size}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2 as never}
        color={strokeColor as never}
        fillRule="evenodd"
      />
    );
  }
  return <MaterialIcons color={color} size={size} name="fitness-center" style={style} />;
}
