import { FitnessCategoryIcon } from '@/components/icons/FitnessCategoryIcon';
import { fitnessIconIds } from '@/components/icons/custom-icons';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import { CategoryStats } from '@/types/category.types';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProgressCategoryChipsProps {
  categories: CategoryStats[];
  selectedId: string | null;
  onSelect: (category: CategoryStats) => void;
}

export function ProgressCategoryChips({
  categories,
  selectedId,
  onSelect,
}: ProgressCategoryChipsProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {categories.map(category => {
        const selected = category.id === selectedId;
        const useCustomIcon = fitnessIconIds.includes(category.icon);
        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect(category)}
            activeOpacity={0.85}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <View
              style={[
                styles.iconWrap,
                useCustomIcon ? { backgroundColor: category.color } : undefined,
              ]}
            >
              {useCustomIcon ? (
                <FitnessCategoryIcon iconId={category.icon} size={18} color="#FFFFFF" />
              ) : (
                <Text style={styles.iconFallback}>◆</Text>
              )}
            </View>
            <Text style={[styles.label, selected && styles.labelSelected]}>{category.name}</Text>
            <Text style={styles.count}>{category.photoCount}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: FitTrackColors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  chipSelected: {
    backgroundColor: FitTrackColors.primaryContainerMuted,
    borderColor: FitTrackColors.primaryContainerBorder,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FitTrackColors.surfaceContainerHigh,
  },
  iconFallback: {
    color: FitTrackColors.onSurfaceVariant,
    fontSize: 12,
  },
  label: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 14,
    color: FitTrackColors.onSurfaceVariant,
  },
  labelSelected: {
    color: FitTrackColors.primaryContainer,
  },
  count: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 10,
    color: FitTrackColors.onSurfaceVariant,
    opacity: 0.7,
  },
});
