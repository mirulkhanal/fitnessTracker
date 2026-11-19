import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HomeWelcomeProps {
  name?: string;
}

export function HomeWelcome({ name = 'Athlete' }: HomeWelcomeProps) {
  const { fitTrackColors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: fitTrackColors.onBackground }]}>
        Welcome back, <Text style={[styles.name, { color: fitTrackColors.onBackground }]}>{name}.</Text>
      </Text>
      <Text style={[styles.subtitle, { color: fitTrackColors.onSurfaceVariant }]}>
        Your progress is tracking perfectly. Keep the momentum.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    fontFamily: FitTrackFonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.64,
    color: FitTrackColors.onBackground,
    marginBottom: 8,
  },
  name: {
    color: FitTrackColors.onBackground,
  },
  subtitle: {
    fontFamily: FitTrackFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: FitTrackColors.onSurfaceVariant,
  },
});
