import { GlassPanel } from '@/components/ui/GlassPanel';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HomeStatsBentoProps {
  totalPhotos: number;
  currentStreak: number;
  lastPhotoLabel: string;
}

export function HomeStatsBento({
  totalPhotos,
  currentStreak,
  lastPhotoLabel,
}: HomeStatsBentoProps) {
  return (
    <View style={styles.grid}>
      <StatCard
        label="TOTAL PHOTOS"
        value={String(totalPhotos)}
        icon="photo.stack"
      />
      <StatCard
        label="DAY STREAK"
        value={String(currentStreak)}
        suffix="Days"
        icon="flame.fill"
      />
      <StatCard label="LAST PHOTO" value={lastPhotoLabel} icon="clock.fill" />
    </View>
  );
}

function StatCard({
  label,
  value,
  suffix,
  icon,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon: React.ComponentProps<typeof IconSymbol>['name'];
}) {
  return (
    <GlassPanel style={styles.card}>
      <View style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <Text style={styles.label}>{label}</Text>
          <IconSymbol name={icon} size={22} color={FitTrackColors.primaryContainer} />
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
        </View>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
    marginBottom: 32,
  },
  card: {
    minHeight: 128,
  },
  cardInner: {
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 128,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    color: FitTrackColors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  value: {
    fontFamily: FitTrackFonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.64,
    color: FitTrackColors.primaryContainer,
  },
  suffix: {
    fontFamily: FitTrackFonts.body,
    fontSize: 16,
    color: FitTrackColors.onSurfaceVariant,
  },
});
