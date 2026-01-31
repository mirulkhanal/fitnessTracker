import {
  CategoryGrid,
  HelpText,
  NewCategoryEntry,
  PhotoPreviewCard,
  SaveButtonBar,
} from '@/components/category-selection/CategorySelectionSections';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useCategorySelection } from '@/hooks/use-category-selection';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function CategorySelectionScreen() {
  const params = useLocalSearchParams();
  const { imageUri, width, height } = params;
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [newCategoryOffset, setNewCategoryOffset] = useState<number | null>(null);
  const {
    categories,
    selectedCategories,
    newCategoryName,
    newCategoryIcon,
    newCategoryColor,
    showNewCategoryInput,
    setNewCategoryName,
    setNewCategoryIcon,
    setNewCategoryColor,
    setShowNewCategoryInput,
    handleCategorySelect,
    handleCreateNewCategory,
    handleSavePhoto,
    resetNewCategory,
  } = useCategorySelection({
    imageUri: imageUri as string,
    width: parseInt(width as string) || 0,
    height: parseInt(height as string) || 0,
  });

  const handleShowNewCategory = useCallback(() => {
    setShowNewCategoryInput(true);
    if (newCategoryOffset === null) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(newCategoryOffset - 12, 0),
        animated: true,
      });
    });
  }, [newCategoryOffset, setShowNewCategoryInput]);

  const handleExpandIcons = useCallback(() => {
    if (newCategoryOffset === null) return;
    requestAnimationFrame(() => {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(newCategoryOffset - 12, 0),
          animated: true,
        });
      }, 60);
    });
  }, [newCategoryOffset]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView ref={scrollRef} style={styles.content} showsVerticalScrollIndicator={false}>
        <PhotoPreviewCard imageUri={imageUri as string} />
        <View style={styles.categorySection}>
          <CategoryGrid
            categories={categories}
            selectedCategories={selectedCategories}
            onSelect={handleCategorySelect}
          />
          <View onLayout={(event) => setNewCategoryOffset(event.nativeEvent.layout.y)}>
            <NewCategoryEntry
              visible={showNewCategoryInput}
              onShow={handleShowNewCategory}
              newCategoryName={newCategoryName}
              onChangeName={setNewCategoryName}
              newCategoryIcon={newCategoryIcon}
              onChangeIcon={(id) => {
                setNewCategoryIcon(id);
              }}
              newCategoryColor={newCategoryColor}
              onChangeColor={setNewCategoryColor}
              onCancel={resetNewCategory}
              onCreate={handleCreateNewCategory}
            onExpandIcons={handleExpandIcons}
            />
          </View>
        </View>
        <HelpText visible={selectedCategories.length === 0} />
        <SaveButtonBar selectedCount={selectedCategories.length} onSave={handleSavePhoto} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  categorySection: {
    marginBottom: 32,
  },
});
