import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from './haptic-tab';

const TAB_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentProps<typeof IconSymbol>['name'] }
> = {
  index: { label: 'HOME', icon: 'house.fill' },
  categories: { label: 'EXPLORE', icon: 'square.grid.2x2' },
  settings: { label: 'SETTINGS', icon: 'gear' },
};

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: bottomPad,
          backgroundColor: FitTrackColors.tabBarBackground,
        },
      ]}
    >
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isActive = state.index === index;
          const config = TAB_CONFIG[route.name] ?? {
            label: options.title?.toUpperCase() ?? route.name.toUpperCase(),
            icon: 'house.fill' as const,
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <HapticTab
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isActive ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <View style={[styles.tabInner, isActive && styles.tabInnerActive]}>
                <IconSymbol
                  name={config.icon}
                  size={24}
                  color={
                    isActive ? FitTrackColors.primaryContainer : FitTrackColors.onSecondaryContainer
                  }
                />
                <Text
                  style={[
                    styles.tabLabel,
                    isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                >
                  {config.label}
                </Text>
              </View>
            </HapticTab>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 72,
  },
  tabInnerActive: {
    backgroundColor: FitTrackColors.primaryContainerMuted,
  },
  tabLabel: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 4,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: FitTrackColors.primaryContainer,
  },
  tabLabelInactive: {
    color: 'rgba(171, 185, 210, 0.6)',
  },
});
