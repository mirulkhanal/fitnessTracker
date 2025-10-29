import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HapticButton } from '@/components/ui/haptic-button';
import { IconSelector } from '@/components/ui/icon-selector';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useCategoriesStore } from '@/store/categories.store';
import { usePhotosStore } from '@/store/photos.store';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export default function CategorySelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { imageUri, width, height } = params;
  const { colors } = useTheme();

  const { categories, createCategory, loadCategories } = useCategoriesStore();
  const { savePhoto } = usePhotosStore();
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('photo.fill');
  const [newCategoryColor, setNewCategoryColor] = useState('#FF6B6B');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Categories are automatically loaded by the store hook

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    setShowNewCategoryInput(false);
  };

  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const newCategory = {
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: newCategoryIcon,
      };

      await createCategory(newCategory);
      // Ensure categories list is up to date, then select the newly created one
      await loadCategories();
      const created = categories
        .filter(c => c.name.trim().toLowerCase() === newCategoryName.trim().toLowerCase() && c.id.startsWith('custom_'))
        .sort((a, b) => (a.id > b.id ? 1 : -1))
        .pop();
      if (created) {
        setSelectedCategories([created.id]);
      }
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'Failed to create category');
    }
  };

  const handleSavePhoto = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Select a category', 'Please select at least one category to continue.');
      return;
    }

    try {
      await savePhoto(
        imageUri as string,
        selectedCategories,
        parseInt(width as string) || 0,
        parseInt(height as string) || 0
      );

      // Navigate back to home screen
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? The photo will be discarded.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: () => router.replace('/(tabs)')
        }
      ]
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Preview */}
        <Card variant="elevated" style={{ ...styles.photoPreview, backgroundColor: colors.cardBackground }}>
          <ThemedText style={styles.previewLabel}>Photo Preview</ThemedText>
          <View style={styles.imageContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri as string }} style={styles.previewImage} />
            ) : (
              <IconSymbol name="photo" size={80} color={colors.icon} />
            )}
          </View>
        </Card>

        {/* Category Selection */}
        <View style={styles.categorySection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Choose Category
          </ThemedText>
          
          <View style={styles.categoriesGrid}>
            {categories
              .filter(category => category.id === 'default' || category.id.startsWith('custom_'))
              .map((category) => (
              <View key={category.id} style={styles.categoryCardWrapper}>
                <HapticButton
                  style={[
                    styles.categoryCard,
                    { backgroundColor: colors.cardBackground },
                    selectedCategories.includes(category.id) && styles.categoryCardSelected,
                    selectedCategories.includes(category.id) && { borderColor: category.color, borderWidth: 2 }
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                  hapticType="light"
                  pressScale={0.95}
                >
                  <View style={styles.categoryCardContent}>
                    <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                      <IconSymbol name={category.icon as any} size={28} color="white" />
                    </View>
                    <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                    {selectedCategories.includes(category.id) && (
                      <View style={styles.selectedIndicator}>
                        <IconSymbol name="checkmark.circle.fill" size={24} color={category.color} />
                      </View>
                    )}
                  </View>
                </HapticButton>
              </View>
            ))}
          </View>

          {/* Create New Category */}
          <HapticButton
            style={[styles.newCategoryButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => setShowNewCategoryInput(true)}
            hapticType="light"
            pressScale={0.95}
          >
            <IconSymbol name="plus" size={24} color={colors.accent} />
            <ThemedText style={styles.newCategoryText}>Create New Category</ThemedText>
          </HapticButton>

          {/* New Category Input */}
          {showNewCategoryInput && (
            <Card variant="elevated" style={{ ...styles.newCategoryInput, backgroundColor: colors.cardBackground }}>
              <Input
                placeholder="Enter category name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus
                style={styles.textInput}
              />
              
              {/* Icon Selection */}
              <IconSelector
                selectedIcon={newCategoryIcon}
                onIconSelect={(icon, color) => {
                  setNewCategoryIcon(icon);
                  setNewCategoryColor(color);
                }}
              />
              
              <View style={styles.inputButtons}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setShowNewCategoryInput(false);
                    setNewCategoryName('');
                    setNewCategoryIcon('photo.fill');
                    setNewCategoryColor('#FF6B6B');
                  }}
                  variant="outline"
                  style={styles.inputButton}
                />
                <Button
                  title="Create"
                  onPress={handleCreateNewCategory}
                  style={styles.inputButton}
                />
              </View>
            </Card>
          )}
        </View>

        {/* Help Text */}
        {selectedCategories.length === 0 && (
          <View style={styles.helpContainer}>
            <ThemedText style={[styles.helpText, { color: colors.icon }]}>
              Please select at least one category to continue.
            </ThemedText>
          </View>
        )}

        {/* Save Button */}
        <HapticButton
          style={[
            styles.saveButtonBottom,
            selectedCategories.length > 0
              ? { backgroundColor: colors.accent }
              : { backgroundColor: colors.icon }
          ]}
          onPress={handleSavePhoto}
          disabled={selectedCategories.length === 0}
          hapticType="success"
          pressScale={0.95}
        >
          <IconSymbol name="checkmark" size={24} color="white" />
          <ThemedText style={styles.saveButtonText}>
            {selectedCategories.length > 0 
              ? `Save Photo (${selectedCategories.length} categories)`
              : 'Select a category to save'
            }
          </ThemedText>
        </HapticButton>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  cancelButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  saveButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
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
  categorySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  inputButtonPrimary: {
    borderColor: 'transparent',
  },
  inputButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputButtonPrimaryText: {
    color: 'white',
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
