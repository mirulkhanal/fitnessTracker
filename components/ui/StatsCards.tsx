import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StatsCardsProps {
  stats: {
    totalPhotos: number;
    currentStreak: number;
    lastPhotoDate?: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const { colors } = useTheme();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Total Photos Card */}
      <View style={[styles.statCard, { backgroundColor: colors.accent + '25' }]}>
        <IconSymbol name="photo.fill" size={20} color={colors.accent} />
        <ThemedText style={[styles.statNumber, { color: colors.accent }]}>
          {stats.totalPhotos}
        </ThemedText>
        <ThemedText style={styles.statLabel}>Total Photos</ThemedText>
      </View>

      {/* Current Streak Card */}
      <View style={[styles.statCard, { backgroundColor: colors.pinkAccent + '25' }]}>
        <IconSymbol name="flame.fill" size={20} color={colors.pinkAccent} />
        <ThemedText style={[styles.statNumber, { color: colors.pinkAccent }]}>
          {stats.currentStreak}
        </ThemedText>
        <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
      </View>

      {/* Last Photo Card */}
      <View style={[styles.statCard, { backgroundColor: colors.purpleAccent + '25' }]}>
        <IconSymbol name="calendar" size={20} color={colors.purpleAccent} />
        <ThemedText style={[styles.statNumber, { color: colors.purpleAccent }]}>
          {stats.lastPhotoDate ? formatDate(stats.lastPhotoDate) : 'Never'}
        </ThemedText>
        <ThemedText style={styles.statLabel}>Last Photo</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    minHeight: 80,
    borderRadius: 16,
  },
  statNumber: {
    fontSize: 18,
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
    lineHeight: 16,
  },
});
