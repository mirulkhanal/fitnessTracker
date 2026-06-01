// Fallback for using MaterialIcons on Android and web.

import { customIcons } from '@/components/icons/custom-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React, { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'folder.fill': 'folder',
  'safari': 'explore',
  'plus': 'add',
  'trash': 'delete',
  'pencil': 'edit',
  'photo.fill': 'photo-camera',
  'photo': 'photo-camera',
  'camera.fill': 'photo-camera',
  'calendar': 'calendar-today',
  'flame.fill': 'local-fire-department',
  'person.fill': 'person',
  'rectangle.fill': 'crop-square',
  'hand.raised.fill': 'pan-tool',
  'figure.walk': 'directions-walk',
  'heart.fill': 'favorite',
  'figure.stand': 'accessibility',
  'checkmark.circle.fill': 'check-circle',
  'checkmark': 'check',
  'gear': 'settings',
  'bell.fill': 'notifications',
  'moon.fill': 'nightlight-round',
  'square.and.arrow.up': 'ios-share',
  'rectangle.portrait.and.arrow.right': 'logout',
  'info.circle': 'info',
  'exclamationmark.triangle.fill': 'warning',
  'xmark.circle.fill': 'cancel',
  'hand.raised': 'pan-tool',
  'star.fill': 'star',
  'leaf.fill': 'eco',
  'drop.fill': 'water-drop',
  'sun.max.fill': 'wb-sunny',
  'cloud.fill': 'cloud',
  'bolt.fill': 'bolt',
  'snow': 'ac-unit',
  'wind': 'air',
  'tornado': 'tornado',
  'hurricane': 'storm',
  'touchid': 'fingerprint',
  'photo.stack': 'photo-library',
  'square.grid.2x2': 'apps',
  'magnifyingglass': 'search',
  'clock.fill': 'schedule',
} as const satisfies Record<string, MaterialIconName>;

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const Custom = (customIcons as any)[name];
  if (Custom) {
    const strokeColor = typeof color === 'string' ? (color as string) : '#FFFFFF';
    // Force outline-only by wrapping with explicit fill/stroke overrides
    return (
      <Custom
        width={size}
        height={size}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2 as any}
        color={strokeColor as any}
        fillRule="evenodd"
      />
    );
  }
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
