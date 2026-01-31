import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';

interface CategoryStatsRowProps {
  photoCount: number;
  latestLabel: string;
}

export function CategoryStatsRow({ photoCount, latestLabel }: CategoryStatsRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.statsContainer}>
      <Card variant="elevated" style={{ ...styles.statItem, backgroundColor: colors.cardBackground }}>
        <IconSymbol name="photo.fill" size={24} color={colors.accent} />
        <ThemedText style={styles.statNumber}>{photoCount}</ThemedText>
        <ThemedText style={styles.statLabel}>Photos</ThemedText>
      </Card>
      <Card variant="elevated" style={{ ...styles.statItem, backgroundColor: colors.cardBackground }}>
        <IconSymbol name="calendar" size={24} color={colors.secondaryAccent} />
        <ThemedText style={styles.statNumber}>{latestLabel}</ThemedText>
        <ThemedText style={styles.statLabel}>Latest</ThemedText>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
    gap: 10,
  },
  statItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    minHeight: 68,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '500',
  },
});
