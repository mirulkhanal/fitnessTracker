import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import { CategoryStats } from '@/types/category.types';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface CategoryListProps {
  categories: CategoryStats[];
  onCategoryPress: (category: CategoryStats) => void;
  onCategoryDelete?: (categoryId: string, categoryName: string) => void;
  onAddCategory: () => void;
  loading?: boolean;
}

export function CategoryList({
  categories,
  onCategoryPress,
  onCategoryDelete,
  onAddCategory,
  loading = false,
}: CategoryListProps) {
  const totalPhotos = categories.reduce((sum, cat) => sum + cat.photoCount, 0);
  const categoriesWithPhotos = categories.filter(cat => cat.photoCount > 0);

  if (loading) {
    return <LoadingSpinner text="Loading categories..." />;
  }

  if (categories.length === 0) {
    const { colors } = useTheme();
    
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
          <IconSymbol name="folder" size={80} color={colors.icon} />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No Categories Yet
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Create your first category to start organizing your progress photos
          </ThemedText>
          <Button
            title="Add Your First Category"
            onPress={onAddCategory}
            icon="plus"
            style={styles.addButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Categories</ThemedText>
        <ThemedText style={styles.subtitle}>
          {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''} across {categoriesWithPhotos.length} categories
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesList}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={onCategoryPress}
              onDelete={onCategoryDelete}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

interface CategoryCardProps {
  category: CategoryStats;
  onPress: (category: CategoryStats) => void;
  onDelete?: (categoryId: string, categoryName: string) => void;
}

function CategoryCard({ category, onPress, onDelete }: CategoryCardProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.categoryCardContainer}>
      <View style={[styles.categoryCard, { 
        backgroundColor: colors.cardBackground,
        borderColor: category.color,
        borderWidth: 1
      }]}>
        <TouchableOpacity
          onPress={() => onPress(category)}
          style={styles.mainContent}
          activeOpacity={0.7}
        >
          <View style={styles.categoryLeft}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
              <IconSymbol name={category.icon as any} size={24} color={category.color} />
            </View>
            <View style={styles.categoryContent}>
              <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
              <ThemedText style={styles.categoryStats}>
                {category.photoCount} photo{category.photoCount !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={20} color={colors.icon} />
        </TouchableOpacity>
        
        <View style={[styles.separator, { backgroundColor: colors.separator }]} />
        <View style={styles.lastPhotoSection}>
          <View style={styles.categoryFooter}>
            <IconSymbol name="calendar" size={12} color={colors.icon} />
            <ThemedText style={styles.lastPhotoDate}>
              Last photo: {category.lastPhotoDate ? new Date(category.lastPhotoDate).toLocaleDateString() : 'Never'}
            </ThemedText>
          </View>
          {onDelete && category.id !== 'default' && (
            <TouchableOpacity
              onPress={() => onDelete(category.id, category.name)}
              style={[styles.deleteButton, { backgroundColor: colors.error }]}
              activeOpacity={0.7}
            >
              <IconSymbol name="trash" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  categoriesList: {
    gap: 8,
  },
  categoryCardContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  categoryCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryStats: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  categoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastPhotoDate: {
    fontSize: 12,
    opacity: 0.6,
    marginLeft: 6,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  lastPhotoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 48,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyTitle: {
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
});
