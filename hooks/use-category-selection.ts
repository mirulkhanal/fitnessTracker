import { useMemo, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { useCategoriesStore } from '@/store/categories.store';
import { usePhotosStore } from '@/store/photos.store';
import { useRouter } from 'expo-router';

interface CategorySelectionParams {
  imageUri: string;
  width: number;
  height: number;
}
export const useCategorySelection = ({ imageUri, width, height }: CategorySelectionParams) => {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { categories, createCategory, loadCategories } = useCategoriesStore();
  const { savePhoto } = usePhotosStore();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('photo.fill');
  const [newCategoryColor, setNewCategoryColor] = useState('#FF6B6B');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const imageParams = useMemo(
    () => ({
      imageUri,
      width,
      height,
    }),
    [height, imageUri, width]
  );

  useRefreshOnFocus(() => loadCategories(), [loadCategories]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
    setShowNewCategoryInput(false);
  };

  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) {
      showAlert({
        title: 'Error',
        message: 'Please enter a category name',
        variant: 'error',
      });
      return;
    }

    try {
      const created = await createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: newCategoryIcon,
      });
      setSelectedCategories([created.id]);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    } catch (error) {
      showAlert({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create category',
        variant: 'error',
      });
    }
  };

  const handleSavePhoto = async () => {
    if (selectedCategories.length === 0) {
      showAlert({
        title: 'Select a category',
        message: 'Please select at least one category to continue.',
        variant: 'warning',
      });
      return;
    }

    try {
      await savePhoto(imageParams.imageUri, selectedCategories, imageParams.width, imageParams.height);
      router.replace('/(tabs)');
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Failed to save photo. Please try again.',
        variant: 'error',
      });
    }
  };

  const resetNewCategory = () => {
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    setNewCategoryIcon('photo.fill');
    setNewCategoryColor('#FF6B6B');
  };

  return {
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
  };
};
