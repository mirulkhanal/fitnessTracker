import { fitnessIconIds } from '@/components/icons/custom-icons';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ThemedText } from '@/components/ui/themed-text';
import { useTheme } from '@/contexts/ThemeContext';
import { CategoryStats } from '@/types/category.types';
import React, { RefObject, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ScrollView, Swipeable } from 'react-native-gesture-handler';

interface CategoryListProps {
  categories: CategoryStats[];
  onCategoryPress: (category: CategoryStats) => void;
  onCategoryDelete?: (categoryId: string, categoryName: string) => void;
  onCategoryEdit?: (category: CategoryStats) => void;
  onAddCategory: () => void;
  loading?: boolean;
}

export function CategoryList({
  categories,
  onCategoryPress,
  onCategoryDelete,
  onCategoryEdit,
  onAddCategory,
  loading = false,
}: CategoryListProps) {
  const totalPhotos = categories.reduce((sum, cat) => sum + cat.photoCount, 0);
  const categoriesWithPhotos = categories.filter(cat => cat.photoCount > 0);
  const swipeableRefs = useRef<Map<string, RefObject<Swipeable>>>(new Map());
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  // Initialize refs for each category
  React.useEffect(() => {
    categories.forEach(category => {
      if (!swipeableRefs.current.has(category.id)) {
        swipeableRefs.current.set(category.id, React.createRef<Swipeable>() as RefObject<Swipeable>);
      }
    });
  }, [categories]);

  const handleSwipeableWillOpen = (categoryId: string) => {
    // If there's already an open category, close it first
    if (openCategoryId && openCategoryId !== categoryId) {
      const previousRef = swipeableRefs.current.get(openCategoryId);
      previousRef?.current?.close();
    }
    // Set this as the new open category
    setOpenCategoryId(categoryId);
  };

  const handleSwipeableClose = (categoryId: string) => {
    // Only clear if this is the currently open one
    if (openCategoryId === categoryId) {
      setOpenCategoryId(null);
    }
  };

  const closeCurrentSwipeable = () => {
    if (openCategoryId) {
      const ref = swipeableRefs.current.get(openCategoryId);
      ref?.current?.close();
      setOpenCategoryId(null);
    }
  };

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

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={closeCurrentSwipeable}
      >
        <View style={styles.categoriesList}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={onCategoryPress}
              onDelete={onCategoryDelete}
              onEdit={onCategoryEdit}
              swipeableRef={swipeableRefs.current.get(category.id)}
              onSwipeableWillOpen={() => handleSwipeableWillOpen(category.id)}
              onSwipeableClose={() => handleSwipeableClose(category.id)}
              onPressCard={closeCurrentSwipeable}
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
  onEdit?: (category: CategoryStats) => void;
  swipeableRef?: RefObject<Swipeable>;
  onSwipeableWillOpen?: () => void;
  onSwipeableClose?: (categoryId: string) => void;
  onPressCard?: () => void;
}

function CategoryCard({ category, onPress, onDelete, onEdit, swipeableRef, onSwipeableWillOpen, onSwipeableClose, onPressCard }: CategoryCardProps) {
  const { colors } = useTheme();
  const localSwipeableRef = useRef<Swipeable>(null);
  const activeRef = swipeableRef || localSwipeableRef;

  const renderRightActions = () => {
    if (!onDelete || category.id === 'default') return null;
    
    return (
      <View style={styles.deleteActionsWrapper}>
        {/* Background that extends behind */}
        <View style={[styles.deleteBackgroundExtender, { backgroundColor: colors.error }]} />
        {/* Visible action container */}
        <TouchableOpacity
          style={[styles.deleteActionButton, { backgroundColor: colors.error }]}
          onPress={() => {
            activeRef.current?.close();
            onDelete(category.id, category.name);
          }}
        >
          <IconSymbol name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderLeftActions = () => {
    if (!onEdit || category.id === 'default') return null;
    
    return (
      <View style={styles.editActionsWrapper}>
        {/* Background that extends behind */}
        <View style={[styles.editBackgroundExtender, { backgroundColor: colors.accent }]} />
        {/* Visible action container */}
        <TouchableOpacity
          style={[styles.editActionButton, { backgroundColor: colors.accent }]}
          onPress={() => {
            activeRef.current?.close();
            onEdit(category);
          }}
        >
          <IconSymbol name="pencil" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.categoryCardContainer}>
      <Swipeable 
        ref={activeRef}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        overshootRight={false}
        overshootLeft={false}
        friction={2}
        rightThreshold={80}
        leftThreshold={80}
        onSwipeableWillOpen={onSwipeableWillOpen}
        onSwipeableClose={() => onSwipeableClose?.(category.id)}
      >
        <View style={[styles.categoryCard, { 
          backgroundColor: colors.cardBackground,
          borderColor: category.color,
          borderWidth: 1
        }]}>
          <TouchableOpacity
            onPress={() => {
              onPressCard?.();
              activeRef.current?.close();
              onPress(category);
            }}
            style={styles.mainContent}
            activeOpacity={0.7}
          >
            <View style={styles.categoryLeft}>
              <View style={[styles.categoryIcon, { 
                backgroundColor: fitnessIconIds.includes(category.icon) ? category.color : category.color + '20' 
              }]}>
                {fitnessIconIds.includes(category.icon) ? (
                  <IconSymbol name={category.icon as any} size={24} color="#FFFFFF" />
                ) : (
                  <IconSymbol name={category.icon as any} size={24} color={category.color} />
                )}
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
          </View>
        </View>
      </Swipeable>
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
  deleteActionsWrapper: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'visible',
  },
  deleteBackgroundExtender: {
    position: 'absolute',
    left: -50,
    right: 0,
    top: 0,
    bottom: 0,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  deleteActionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  editActionsWrapper: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    overflow: 'visible',
  },
  editBackgroundExtender: {
    position: 'absolute',
    right: -50,
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  editActionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
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
