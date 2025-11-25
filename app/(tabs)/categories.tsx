import { AnimatedAddButton } from '@/components/animated/animated-add-button';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { CategoryList } from '@/components/lists/CategoryList';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useCategoriesStore } from '@/store/categories.store';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet } from 'react-native';

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const {
    categoryStats,
    loading,
    createCategory,
    deleteCategory,
    updateCategory,
    loadCategoryStats,
  } = useCategoriesStore();

  useFocusEffect(
    React.useCallback(() => {
      loadCategoryStats();
    }, [loadCategoryStats])
  );

  const handleCategoryPress = (category: any) => {
    router.push({
      pathname: '/category-view',
      params: {
        categoryId: category.id,
        categoryName: category.name,
      }
    });
  };

  const handleAddCategory = async (request: any) => {
    try {
      await createCategory(request);
      setModalVisible(false);
      setEditingCategory(null);
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleUpdateCategory = async (request: any) => {
    if (!editingCategory) return;
    
    try {
      await updateCategory(editingCategory.id, request);
      setModalVisible(false);
      setEditingCategory(null);
    } catch (error) {
      // Error already handled in store
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    // Prevent deletion of the "Default" category
    if (categoryId === 'default') {
      Alert.alert(
        'Cannot Delete',
        'The "Default" category cannot be deleted as it is a system category.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"? This will remove the category from all photos. Photos with no remaining categories will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(categoryId);
            } catch (error) {
              // Error already handled in store
            }
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background, shadowOpacity: 0, elevation: 0 }]}>
      <CategoryList
        categories={categoryStats}
        onCategoryPress={handleCategoryPress}
        onCategoryDelete={handleDeleteCategory}
        onCategoryEdit={handleEditCategory}
        onAddCategory={() => setModalVisible(true)}
        loading={loading}
      />

      <AnimatedAddButton 
        onPress={() => setModalVisible(true)}
        hapticType="medium"
        pressScale={0.9}
      />

      {/* Add Category Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setEditingCategory(null);
        }}
      >
        <ThemedView style={[styles.modalOverlay, { backgroundColor: colors.background }]}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <ScrollView 
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <CategoryForm
                onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
                onCancel={() => {
                  setModalVisible(false);
                  setEditingCategory(null);
                }}
                loading={loading}
                initialName={editingCategory?.name}
                initialIcon={editingCategory?.icon}
                initialColor={editingCategory?.color}
              />
            </ScrollView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxWidth: '90%',
    maxHeight: '85%',
    width: '100%',
  },
  modalScrollContent: {
    flexGrow: 1,
  },
});
