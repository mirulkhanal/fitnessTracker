import { fitnessIconIds } from '@/components/icons/custom-icons';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/contexts/ThemeContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface FitnessIconPickerProps {
  value?: string;
  onChange: (iconId: string, color?: string) => void;
  onColorChange?: (color: string) => void; // Optional callback for color updates
  columns?: number;
  itemSize?: number;
  icons?: string[]; // allow custom subset
  collapsible?: boolean;
  visibleIcons?: number; // number of icons to show when collapsed
}

function getRandomColor() {
  const palette = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#22C55E', '#06B6D4',
  ];
  return palette[Math.floor(Math.random() * palette.length)];
}

export const FitnessIconPicker: React.FC<FitnessIconPickerProps> = ({
  value,
  onChange,
  onColorChange,
  columns = 5,
  itemSize = 56,
  icons = fitnessIconIds,
  collapsible = false,
  visibleIcons = 5,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const iconBgMap = useMemo(() => {
    const map: Record<string, string> = {};
    icons.forEach((id) => {
      map[id] = getRandomColor();
    });
    return map;
  }, [icons]);

  const visibleData = collapsible && !isExpanded 
    ? icons.slice(0, visibleIcons)
    : icons;

  const renderIcon = (item: string) => {
    const selected = value === item;
    const handlePress = () => {
      const color = iconBgMap[item];
      onChange(item, color);
      if (onColorChange) {
        onColorChange(color);
      }
    };
    
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
            backgroundColor: iconBgMap[item],
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={handlePress}
        >
          <IconSymbol name={item as any} size={34} color={'#FFFFFF'} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
    if (selected) {
      return (
        <View style={{
          padding: 2,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: colors.accent,
        }}>
          {tile}
        </View> 
      );
    }
    return tile;
  };

  // Create rows from the visible data, padding each row to exactly `columns` items
  const rows: Array<Array<string | null>> = [];
  for (let i = 0; i < visibleData.length; i += columns) {
    const row: Array<string | null> = visibleData.slice(i, i + columns);
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
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.expandButton}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isExpanded ? "expand-less" : "expand-more"}
            size={24}
            color={colors.accent}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  expandButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
});


