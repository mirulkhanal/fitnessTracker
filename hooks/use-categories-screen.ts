import { useCallback, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { useCategoriesStore } from '@/store/categories.store';
import { CategoryStats, CreateCategoryRequest } from '@/types/category.types';
import { router } from 'expo-router';
export const useCategoriesScreen = () => {
  const { showAlert } = useAlert();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryStats | null>(null);

  const {
    categoryStats,
    loading,
    createCategory,
    deleteCategory,
    updateCategory,
    loadCategoryStats,
  } = useCategoriesStore();

  useRefreshOnFocus(() => loadCategoryStats(), [loadCategoryStats]);

  const handleCategoryPress = useCallback((category: CategoryStats) => {
    router.push({
      pathname: '/category-view',
      params: {
        categoryId: category.id,
        categoryName: category.name,
      },
    });
  }, []);

  const handleAddCategory = useCallback(
    async (request: CreateCategoryRequest) => {
      try {
        await createCategory(request);
        setModalVisible(false);
        setEditingCategory(null);
      } catch (error) {
        showAlert({
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to create category',
          variant: 'error',
        });
      }
    },
    [createCategory, showAlert]
  );

  const handleEditCategory = useCallback((category: CategoryStats) => {
    setEditingCategory(category);
    setModalVisible(true);
  }, []);

  const handleUpdateCategory = useCallback(
    async (request: CreateCategoryRequest) => {
      if (!editingCategory) return;
      try {
        await updateCategory(editingCategory.id, request);
        setModalVisible(false);
        setEditingCategory(null);
      } catch (error) {
        showAlert({
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to update category',
          variant: 'error',
        });
      }
    },
    [editingCategory, showAlert, updateCategory]
  );

  const handleDeleteCategory = useCallback(
    async (categoryId: string, categoryName: string) => {
      if (categoryId === 'default') {
        showAlert({
          title: 'Cannot Delete',
          message: 'The "Default" category cannot be deleted as it is a system category.',
          variant: 'info',
        });
        return;
      }

      showAlert({
        title: 'Delete Category',
        message: `Are you sure you want to delete "${categoryName}"? This will remove the category from all photos. Photos with no remaining categories will be deleted.`,
        variant: 'warning',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteCategory(categoryId);
              } catch (error) {
                showAlert({
                  title: 'Error',
                  message: error instanceof Error ? error.message : 'Failed to delete category',
                  variant: 'error',
                });
              }
            },
          },
        ],
      });
    },
    [deleteCategory, showAlert]
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingCategory(null);
  }, []);

  return {
    categoryStats,
    loading,
    modalVisible,
    editingCategory,
    setModalVisible,
    handleCategoryPress,
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    closeModal,
  };
};
