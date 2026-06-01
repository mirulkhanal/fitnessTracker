import { CategoriesExploreView } from '@/components/categories/CategoriesExploreView';
import { CategoryFormModal } from '@/components/categories/CategoryFormModal';
import { HomeTopBar } from '@/components/home/HomeTopBar';
import { ScreenLoading } from '@/components/ui/ScreenLoading';
import { FitTrackColors } from '@/constants/fittrack-theme';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCategoriesScreen } from '@/hooks/use-categories-screen';
import { CategoryStats } from '@/types/category.types';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { ActionSheetIOS, Platform, StyleSheet, View } from 'react-native';

const HEADER_OFFSET = 108;

export default function CategoriesScreen() {
  const { showAlert } = useAlert();
  const { session } = useAuth();
  const displayName = session?.display_name?.trim() || 'Athlete';

  const {
    categoryStats,
    loading,
    modalVisible,
    editingCategory,
    handleCategoryPress,
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    closeModal,
    setModalVisible,
  } = useCategoriesScreen();

  const handleCategoryLongPress = useCallback(
    (category: CategoryStats) => {
      if (category.id === 'default') {
        return;
      }

      const openEdit = () => handleEditCategory(category);
      const openDelete = () => handleDeleteCategory(category.id, category.name);

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Edit category', 'Delete category', 'Cancel'],
            destructiveButtonIndex: 1,
            cancelButtonIndex: 2,
            title: category.name,
          },
          index => {
            if (index === 0) {
              openEdit();
            } else if (index === 1) {
              openDelete();
            }
          }
        );
        return;
      }

      showAlert({
        title: category.name,
        message: 'Choose an action',
        variant: 'info',
        buttons: [
          { text: 'Edit', onPress: openEdit },
          { text: 'Delete', style: 'destructive', onPress: openDelete },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
    },
    [handleDeleteCategory, handleEditCategory, showAlert]
  );

  return (
    <View style={styles.container}>
      <HomeTopBar
        avatarUrl={session?.avatar_url}
        displayName={displayName}
        onProfilePress={() => router.push('/(tabs)/settings')}
        onNotificationsPress={() => {
          showAlert({
            title: 'Notifications',
            message: 'Workout reminders are coming in a future update.',
            variant: 'info',
          });
        }}
      />

      <View style={[styles.body, { paddingTop: HEADER_OFFSET }]}>
        {loading && categoryStats.length === 0 ? (
          <ScreenLoading text="Loading categories..." />
        ) : (
          <CategoriesExploreView
            categories={categoryStats}
            loading={loading}
            onCategoryPress={handleCategoryPress}
            onCategoryLongPress={handleCategoryLongPress}
            onAddCategory={() => setModalVisible(true)}
          />
        )}
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FitTrackColors.background,
  },
  body: {
    flex: 1,
  },
});
