import { useTheme } from '@/contexts/ThemeContext';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from './haptic-tab';

const { width: screenWidth } = Dimensions.get('window');

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const totalTabs = state.routes.length;
  const tabWidth = screenWidth / totalTabs;
  
  const indicatorPosition = useSharedValue(state.index * tabWidth);

  // Update indicator position when active tab changes
  React.useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth, {
      damping: 20,
      stiffness: 200,
      mass: 1,
    });
  }, [indicatorPosition, state.index, tabWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  return (
    <View style={[
      styles.tabBar, 
      { 
        backgroundColor: colors.background,
        paddingBottom: Math.max(insets.bottom, 8),
        height: 60 + Math.max(insets.bottom, 8),
      }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isActive = state.index === index;

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
            style={{ flex: 1 }}
          >
            <View style={styles.tabContent}>
              {options.tabBarIcon?.({ 
                focused: isActive, 
                color: isActive ? colors.tint : colors.tabIconDefault,
                size: 28 
              })}
            </View>
          </HapticTab>
        );
      })}
      
      {/* Animated Bottom Indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { 
            backgroundColor: colors.tint,
            bottom: Math.max(insets.bottom, 8), // Position above safe area
          },
          animatedIndicatorStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    left: 0,
    width: screenWidth / 3, // Assuming 3 tabs
    height: 3,
    borderRadius: 2,
  },
});
