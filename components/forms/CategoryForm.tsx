import { FitnessIconPicker } from '@/components/icons/FitnessIconPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/themed-text';
import { CategoryColorPalette } from '@/constants/theme';
import { FitTrackColors, FitTrackFonts, FitTrackRadius } from '@/constants/fittrack-theme';
import { useTheme } from '@/contexts/ThemeContext';
import { CreateCategoryRequest } from '@/types/category.types';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface CategoryFormProps {
  onSubmit: (request: CreateCategoryRequest) => void;
  onCancel: () => void;
  loading?: boolean;
  initialName?: string;
  initialIcon?: string;
  initialColor?: string;
  variant?: 'default' | 'fittrack';
}

export function CategoryForm({
  onSubmit,
  onCancel,
  loading = false,
  initialName = '',
  initialIcon = 'photo.fill',
  initialColor = '#10B981',
  variant = 'default',
}: CategoryFormProps) {
  const { colors } = useTheme();
  const [name, setName] = useState(initialName);
  const [icon, setIcon] = useState(initialIcon);
  const [color, setColor] = useState(initialColor);
  const [error, setError] = useState<string | undefined>(undefined);
  const [nameFocused, setNameFocused] = useState(false);

  const isEditing = Boolean(initialName?.trim());
  const title = isEditing ? 'Edit Category' : 'Add New Category';
  const submitLabel = isEditing ? 'Update' : 'Create';

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }

    setError(undefined);
    onSubmit({
      name: name.trim(),
      icon,
      color,
    });
  };

  if (variant === 'fittrack') {
    return (
      <View style={styles.fittrackContainer}>
        <Text style={styles.fittrackTitle}>{title}</Text>

        <View style={styles.fittrackSection}>
          <Text style={styles.fittrackLabel}>CATEGORY NAME</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={[
                styles.fittrackInput,
                nameFocused && styles.fittrackInputFocused,
              ]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) {
                  setError(undefined);
                }
              }}
              placeholder="Enter category name"
              placeholderTextColor="rgba(195, 201, 178, 0.5)"
              autoFocus
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
            <View
              style={[
                styles.inputUnderline,
                nameFocused && styles.inputUnderlineActive,
              ]}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.fittrackSection}>
          <FitnessIconPicker
            variant="fittrack"
            value={icon}
            onChange={setIcon}
            collapsible
            visibleIcons={4}
            columns={4}
            itemSize={56}
          />
        </View>

        <View style={styles.fittrackSection}>
          <Text style={styles.fittrackLabel}>CHOOSE COLOR</Text>
          <View style={styles.colorGridFittrack}>
            {CategoryColorPalette.map((paletteColor) => {
              const isSelected = paletteColor === color;
              return (
                <TouchableOpacity
                  key={paletteColor}
                  onPress={() => setColor(paletteColor)}
                  activeOpacity={0.85}
                  style={[
                    styles.colorSwatchFittrack,
                    { backgroundColor: paletteColor },
                    isSelected && styles.colorSwatchSelected,
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.fittrackActions}>
          <TouchableOpacity
            style={styles.cancelAction}
            onPress={onCancel}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.cancelActionText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createAction, loading && styles.createActionDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.88}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={FitTrackColors.onPrimaryContainer} size="small" />
            ) : (
              <Text style={styles.createActionText}>{submitLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>

      <Input
        label="Category Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter category name"
        error={error}
        autoFocus
        style={styles.input}
      />

      <FitnessIconPicker
        value={icon}
        selectedColor={color}
        onChange={setIcon}
        collapsible
        visibleIcons={4}
        columns={4}
      />

      <View style={styles.colorSection}>
        <ThemedText style={styles.colorLabel}>Choose Color</ThemedText>
        <View style={styles.colorGrid}>
          {CategoryColorPalette.map((paletteColor) => {
            const isSelected = paletteColor === color;
            return (
              <TouchableOpacity
                key={paletteColor}
                onPress={() => setColor(paletteColor)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: paletteColor },
                  isSelected && { borderColor: colors.accent, borderWidth: 3 },
                ]}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.buttons}>
        <Button title="Cancel" onPress={onCancel} variant="outline" style={styles.button} />
        <Button
          title={submitLabel}
          onPress={handleSubmit}
          loading={loading}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
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
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fittrackContainer: {
    padding: 28,
    gap: 24,
  },
  fittrackTitle: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 24,
    lineHeight: 32,
    color: FitTrackColors.onSurface,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  fittrackSection: {
    gap: 8,
  },
  fittrackLabel: {
    fontFamily: FitTrackFonts.mono,
    fontSize: 12,
    letterSpacing: 1.2,
    color: FitTrackColors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  inputWrap: {
    position: 'relative',
  },
  fittrackInput: {
    fontFamily: FitTrackFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: FitTrackColors.onSurface,
    backgroundColor: 'rgba(28, 43, 60, 0.5)',
    borderTopLeftRadius: FitTrackRadius.lg,
    borderTopRightRadius: FitTrackRadius.lg,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: FitTrackColors.surfaceVariant,
  },
  fittrackInputFocused: {
    borderBottomColor: 'transparent',
  },
  inputUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: FitTrackColors.surfaceVariant,
  },
  inputUnderlineActive: {
    backgroundColor: FitTrackColors.primaryContainer,
  },
  errorText: {
    fontFamily: FitTrackFonts.body,
    fontSize: 13,
    color: FitTrackColors.error,
    marginTop: 4,
  },
  colorGridFittrack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
  },
  colorSwatchFittrack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.1 }],
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  fittrackActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  cancelAction: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: FitTrackRadius.md,
    backgroundColor: FitTrackColors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelActionText: {
    fontFamily: FitTrackFonts.bodySemi,
    fontSize: 14,
    color: FitTrackColors.onSurface,
  },
  createAction: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: FitTrackRadius.md,
    backgroundColor: FitTrackColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: FitTrackColors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  createActionDisabled: {
    opacity: 0.75,
  },
  createActionText: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 18,
    color: FitTrackColors.onPrimaryContainer,
  },
});
