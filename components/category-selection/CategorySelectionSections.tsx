import { FitnessIconPicker } from '@/components/icons/FitnessIconPicker';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HapticButton } from '@/components/ui/haptic-button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/themed-text';
import { CategoryColorPalette } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Category } from '@/types/category.types';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface PhotoPreviewCardProps {
  imageUri: string | null | undefined;
}

export function PhotoPreviewCard({ imageUri }: PhotoPreviewCardProps) {
  const { colors } = useTheme();

  return (
    <Card variant="elevated" style={{ ...styles.photoPreview, backgroundColor: colors.cardBackground }}>
      <ThemedText style={styles.previewLabel}>Photo Preview</ThemedText>
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        ) : (
          <IconSymbol name="photo" size={80} color={colors.icon} />
        )}
      </View>
    </Card>
  );
}

interface CategoryGridProps {
  categories: Category[];
  selectedCategories: string[];
  onSelect: (categoryId: string) => void;
}

export function CategoryGrid({ categories, selectedCategories, onSelect }: CategoryGridProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.categoriesGrid}>
      {categories.map((category) => (
          <View key={category.id} style={styles.categoryCardWrapper}>
            <HapticButton
              style={[
                styles.categoryCard,
                { backgroundColor: colors.cardBackground },
                selectedCategories.includes(category.id) && styles.categoryCardSelected,
                selectedCategories.includes(category.id) && { borderColor: category.color, borderWidth: 2 },
              ]}
              onPress={() => onSelect(category.id)}
              hapticType="light"
              pressScale={0.95}
            >
              <View style={styles.categoryCardContent}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <IconSymbol name={category.icon as any} size={28} color="white" />
                </View>
                <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                {selectedCategories.includes(category.id) ? (
                  <View style={styles.selectedIndicator}>
                    <IconSymbol name="checkmark.circle.fill" size={24} color={category.color} />
                  </View>
                ) : null}
              </View>
            </HapticButton>
          </View>
        ))}
    </View>
  );
}

interface NewCategoryEntryProps {
  visible: boolean;
  onShow: () => void;
  newCategoryName: string;
  onChangeName: (value: string) => void;
  newCategoryIcon: string;
  onChangeIcon: (id: string) => void;
  newCategoryColor: string;
  onChangeColor: (color: string) => void;
  onCancel: () => void;
  onCreate: () => void;
  onExpandIcons?: () => void;
}

export function NewCategoryEntry({
  visible,
  onShow,
  newCategoryName,
  onChangeName,
  newCategoryIcon,
  onChangeIcon,
  newCategoryColor,
  onChangeColor,
  onCancel,
  onCreate,
  onExpandIcons,
}: NewCategoryEntryProps) {
  const { colors } = useTheme();
  const [iconGridWidth, setIconGridWidth] = React.useState(0);
  const iconColumns = 4;
  const iconGap = 12;
  const iconItemSize =
    iconGridWidth > 0
      ? Math.floor((iconGridWidth - iconGap * (iconColumns - 1)) / iconColumns)
      : 56;

  return (
    <>
      <HapticButton
        style={[styles.newCategoryButton, { backgroundColor: colors.cardBackground }]}
        onPress={onShow}
        hapticType="light"
        pressScale={0.95}
      >
        <IconSymbol name="plus" size={24} color={colors.accent} />
        <ThemedText style={styles.newCategoryText}>Create New Category</ThemedText>
      </HapticButton>

      {visible ? (
        <Card variant="elevated" style={{ ...styles.newCategoryInput, backgroundColor: colors.cardBackground }}>
          <Input
            placeholder="Enter category name"
            value={newCategoryName}
            onChangeText={onChangeName}
            autoFocus
            style={styles.textInput}
          />
          <View onLayout={(event) => setIconGridWidth(event.nativeEvent.layout.width)}>
            <FitnessIconPicker
              value={newCategoryIcon}
              selectedColor={newCategoryColor}
              onChange={(id) => onChangeIcon(id)}
              onToggleExpand={(expanded) => {
                if (expanded) {
                  onExpandIcons?.();
                }
              }}
              collapsible={true}
              visibleIcons={4}
              columns={iconColumns}
              itemSize={iconItemSize}
            />
          </View>
          <View style={styles.colorSection}>
            <ThemedText style={styles.colorLabel}>Choose Color</ThemedText>
            <View style={styles.colorGrid}>
              {CategoryColorPalette.map((paletteColor) => {
                const isSelected = paletteColor === newCategoryColor;
                return (
                  <TouchableOpacity
                    key={paletteColor}
                    onPress={() => onChangeColor(paletteColor)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: paletteColor },
                      isSelected && { borderColor: colors.text, borderWidth: 3 },
                    ]}
                  />
                );
              })}
            </View>
          </View>
          <View style={styles.inputButtons}>
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="outline"
              style={styles.inputButton}
            />
            <Button
              title="Create"
              onPress={onCreate}
              style={styles.inputButton}
            />
          </View>
        </Card>
      ) : null}
    </>
  );
}

interface HelpTextProps {
  visible: boolean;
}

export function HelpText({ visible }: HelpTextProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.helpContainer}>
      <ThemedText style={[styles.helpText, { color: colors.icon }]}>
        Please select at least one category to continue.
      </ThemedText>
    </View>
  );
}

interface SaveButtonBarProps {
  selectedCount: number;
  onSave: () => void;
}

export function SaveButtonBar({ selectedCount, onSave }: SaveButtonBarProps) {
  const { colors } = useTheme();
  const isEnabled = selectedCount > 0;

  return (
    <HapticButton
      style={[
        styles.saveButtonBottom,
        isEnabled ? { backgroundColor: colors.accent } : { backgroundColor: colors.icon },
      ]}
      onPress={onSave}
      disabled={!isEnabled}
      hapticType="success"
      pressScale={0.95}
    >
      <IconSymbol name="checkmark" size={24} color="white" />
      <ThemedText style={styles.saveButtonText}>
        {isEnabled ? `Save Photo (${selectedCount} categories)` : 'Select a category to save'}
      </ThemedText>
    </HapticButton>
  );
}

const styles = StyleSheet.create({
  photoPreview: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  previewLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 58,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minHeight: 120,
  },
  categoryCardContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCardSelected: {
    elevation: 8,
    shadowOpacity: 0.25,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  newCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginBottom: 16,
  },
  newCategoryText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  newCategoryInput: {
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  textInput: {
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
  },
  inputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  colorSection: {
    marginTop: 20,
  },
  colorLabel: {
    marginBottom: 12,
    textAlign: 'left',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  helpContainer: {
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  saveButtonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
