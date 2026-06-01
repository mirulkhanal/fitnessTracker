import { IconSymbol } from '@/components/ui/icon-symbol';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AddCategoryCardProps {
  onPress: () => void;
}

export function AddCategoryCard({ onPress }: AddCategoryCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.touchable}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <IconSymbol name="plus" size={28} color={FitTrackColors.onSurfaceVariant} />
        </View>
        <Text style={styles.label}>Add Custom Category</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 24,
  },
  card: {
    minHeight: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: FitTrackColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FitTrackColors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  label: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: FitTrackColors.onSurfaceVariant,
    textAlign: 'center',
  },
});
