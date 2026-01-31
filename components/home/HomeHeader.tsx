import React from 'react';
import { StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';

interface HomeHeaderProps {
  title: string;
  subtitle: string;
}

export function HomeHeader({ title, subtitle }: HomeHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <View style={[styles.logoCircle, { backgroundColor: colors.accent }]}>
          <IconSymbol name="photo.fill" size={32} color="white" />
        </View>
      </View>
      <ThemedText type="title" style={styles.headerTitle}>
        {title}
      </ThemedText>
      <ThemedText style={styles.headerSubtitle}>{subtitle}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 18,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 24,
  },
});
