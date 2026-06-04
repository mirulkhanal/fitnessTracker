import { fitnessIconIds } from '@/components/icons/custom-icons';
import { FitnessCategoryIcon } from '@/components/icons/FitnessCategoryIcon';
import { FitTrackColors } from '@/constants/fittrack-theme';
import { useTheme } from '@/contexts/ThemeContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface FitnessIconPickerProps {
  value?: string;
  selectedColor?: string;
  onChange: (iconId: string) => void;
  onToggleExpand?: (expanded: boolean) => void;
  columns?: number;
  itemSize?: number;
  icons?: string[];
  collapsible?: boolean;
  visibleIcons?: number;
  variant?: 'default' | 'fittrack';
}

export const FitnessIconPicker: React.FC<FitnessIconPickerProps> = ({
  value,
  selectedColor,
  onChange,
  onToggleExpand,
  columns = 5,
  itemSize = 56,
  icons = fitnessIconIds,
  collapsible = false,
  visibleIcons = 5,
  variant = 'default',
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const isFitTrack = variant === 'fittrack';

  const visibleData = collapsible && !isExpanded ? icons.slice(0, visibleIcons) : icons;

  const renderIcon = (item: string) => {
    const selected = value === item;
    const handlePress = () => {
      onChange(item);
    };

    if (isFitTrack) {
      return (
        <TouchableOpacity
          key={item}
          onPress={handlePress}
          activeOpacity={0.85}
          style={[
            styles.fittrackTile,
            {
              width: itemSize,
              height: itemSize,
            },
            selected && styles.fittrackTileSelected,
          ]}
        >
          <FitnessCategoryIcon
            iconId={item}
            size={28}
            color={selected ? FitTrackColors.primaryContainer : FitTrackColors.onSurfaceVariant}
          />
        </TouchableOpacity>
      );
    }

    const activeColor = selectedColor || colors.accent;
    const iconColor = selected ? '#FFFFFF' : colors.icon;
    const iconBackground = selected ? activeColor : colors.cardBackground;

    const tile = (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          styles.item,
          {
            width: itemSize,
            height: itemSize,
            borderRadius: 12,
            backgroundColor: 'transparent',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          style={{
            width: itemSize - 12,
            height: itemSize - 12,
            borderRadius: 10,
            backgroundColor: iconBackground,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={handlePress}
        >
          <FitnessCategoryIcon iconId={item} size={34} color={iconColor} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
    if (selected) {
      return (
        <View
          style={{
            padding: 2,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: activeColor,
          }}
        >
          {tile}
        </View>
      );
    }
    return tile;
  };

  // Create rows from the visible data, padding each row to exactly `columns` items
  const rows: (string | null)[][] = [];
  for (let i = 0; i < visibleData.length; i += columns) {
    const row: (string | null)[] = visibleData.slice(i, i + columns);
    // Pad row with nulls to ensure consistent column count
    while (row.length < columns) {
      row.push(null);
    }
    rows.push(row);
  }

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item, itemIndex) => item ? <React.Fragment key={item}>{renderIcon(item)}</React.Fragment> : <View key={itemIndex} style={{ width: itemSize, height: itemSize }} />)}
        </View>
      ))}
      {collapsible && (
        <TouchableOpacity
          onPress={() => {
            setIsExpanded((prev) => {
              const next = !prev;
              onToggleExpand?.(next);
              return next;
            });
          }}
          style={styles.expandButton}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={isFitTrack ? 20 : 24}
            color={isFitTrack ? FitTrackColors.onSurfaceVariant : colors.accent}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fittrackTile: {
    borderRadius: 12,
    backgroundColor: 'rgba(28, 43, 60, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fittrackTileSelected: {
    backgroundColor: FitTrackColors.primaryContainerMuted,
    borderColor: FitTrackColors.primaryContainerBorder,
    shadowColor: FitTrackColors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  expandButton: {
    alignItems: 'center',
    padding: 8,
    marginTop: 4,
  },
});
