import { AddCategoryCard } from '@/components/categories/AddCategoryCard';
import { CategoryExploreCard } from '@/components/categories/CategoryExploreCard';
import { CategorySearchBar } from '@/components/categories/CategorySearchBar';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { FitTrackColors, FitTrackFonts } from '@/constants/fittrack-theme';
import { CategoryStats } from '@/types/category.types';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface CategoriesExploreViewProps {
  categories: CategoryStats[];
  loading?: boolean;
  onCategoryPress: (category: CategoryStats) => void;
  onCategoryLongPress?: (category: CategoryStats) => void;
  onAddCategory: () => void;
}

export function CategoriesExploreView({
  categories,
  loading = false,
  onCategoryPress,
  onCategoryLongPress,
  onAddCategory,
}: CategoriesExploreViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return categories;
    }
    return categories.filter(category => category.name.toLowerCase().includes(query));
  }, [categories, searchQuery]);

  if (loading && categories.length === 0) {
    return <ScreenLoading text="Loading categories..." />;
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Fitness Categories</Text>
        <Text style={styles.subtitle}>
          Select a muscle group or workout type to view your progress photos and tracking data.
        </Text>
      </View>

      <CategorySearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {filteredCategories.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {searchQuery.trim() ? 'No matching categories' : 'No categories yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery.trim()
              ? 'Try a different search term.'
              : 'Create a custom category to organize your progress photos.'}
          </Text>
        </View>
      ) : (
        filteredCategories.map(category => (
          <CategoryExploreCard
            key={category.id}
            category={category}
            onPress={onCategoryPress}
            onLongPress={onCategoryLongPress}
          />
        ))
      )}

      <AddCategoryCard onPress={onAddCategory} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: FitTrackFonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.64,
    color: FitTrackColors.onBackground,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FitTrackFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: FitTrackColors.onSurfaceVariant,
    maxWidth: 520,
  },
  empty: {
    paddingVertical: 32,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: FitTrackFonts.displaySemi,
    fontSize: 20,
    color: FitTrackColors.onBackground,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: FitTrackFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: FitTrackColors.onSurfaceVariant,
  },
});
