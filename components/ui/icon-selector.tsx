import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (icon: string, color: string) => void;
  title?: string;
  selectedColor?: string;
}

// Available icons for category selection
const availableIcons = [
  'photo.fill', 'person.fill', 'heart.fill', 'star.fill', 'flame.fill',
  'leaf.fill', 'drop.fill', 'sun.max.fill', 'moon.fill', 'cloud.fill',
  'bolt.fill', 'snow', 'wind', 'tornado', 'hurricane'
];

// Predefined vibrant colors for icons
const iconColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
  '#A9DFBF', '#F9E79F', '#D5A6BD', '#A3E4D7', '#FADBD8'
];

// Generate a random color for each icon
const getRandomIconColor = (): string => {
  const randomIndex = Math.floor(Math.random() * iconColors.length);
  return iconColors[randomIndex];
};

export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onIconSelect,
  title = 'Choose Icon:',
  selectedColor
}) => {
  const { colors } = useTheme();
  const [iconColorMap, setIconColorMap] = useState<Record<string, string>>({});

  // Generate random colors for all icons when component mounts
  useEffect(() => {
    const map: Record<string, string> = {};
    availableIcons.forEach((icon) => {
      map[icon] = getRandomIconColor();
    });
    setIconColorMap(map);
  }, []); // Empty dependency array means this runs once when component mounts

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <View style={styles.iconGrid}>
        {availableIcons.map((icon) => {
          const iconColor = iconColorMap[icon];
          const isSelected = selectedIcon === icon;
          
          return (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                { backgroundColor: iconColor + '20' },
                isSelected && styles.iconOptionSelected,
                isSelected && { borderColor: iconColor, borderWidth: 3 }
              ]}
              onPress={() => onIconSelect(icon, iconColor)}
            >
              <IconSymbol name={icon as any} size={24} color={iconColor} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconOptionSelected: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
