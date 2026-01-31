import { AnimatedAddButton } from '@/components/animated/animated-add-button';
import { CategoryFormModal } from '@/components/categories/CategoryFormModal';
import { CategoryList } from '@/components/lists/CategoryList';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useCategoriesScreen } from '@/hooks/use-categories-screen';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const {
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
  } = useCategoriesScreen();

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

      <CategoryFormModal
        visible={modalVisible}
        loading={loading}
        onClose={closeModal}
        onCancel={closeModal}
        onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
        initialName={editingCategory?.name}
        initialIcon={editingCategory?.icon}
        initialColor={editingCategory?.color}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
