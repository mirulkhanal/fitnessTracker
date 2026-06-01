import { useCallback, useEffect, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { useImagePickerModal } from '@/hooks/use-image-picker-modal';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { useCategoriesStore } from '@/store/categories.store';
import { usePhotosStore } from '@/store/photos.store';

const normalizeRouteParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
};

export const useCategoryPhotoActions = (categoryIdParam: string | string[] | undefined) => {
  const categoryId = normalizeRouteParam(categoryIdParam);
  const { showAlert } = useAlert();
  const { handleCameraPress, handleGalleryPress } = useImagePickerModal();
  const { loading, getPhotosByCategory, savePhoto, deletePhoto, loadPhotos } = usePhotosStore();
  const { loadCategoryStats } = useCategoriesStore();
  const [modalVisible, setModalVisible] = useState(false);

  const refresh = useCallback(async () => {
    if (!categoryId) {
      return;
    }
    await Promise.all([loadPhotos(categoryId), loadCategoryStats()]);
  }, [categoryId, loadCategoryStats, loadPhotos]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useRefreshOnFocus(refresh, [refresh]);

  const photos = getPhotosByCategory(categoryId);

  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
      showAlert({
        title: 'Delete Photo',
        message: 'Are you sure you want to delete this photo?',
        variant: 'warning',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deletePhoto(photoId);
                await loadPhotos(categoryId);
              } catch (error) {
                showAlert({
                  title: 'Delete failed',
                  message:
                    error instanceof Error ? error.message : 'Could not delete this photo.',
                  variant: 'error',
                });
              }
            },
          },
        ],
      });
    },
    [categoryId, deletePhoto, loadPhotos, showAlert]
  );

  const saveCapturedPhoto = useCallback(
    async (capture: { uri: string; width?: number; height?: number }) => {
      try {
        await savePhoto(capture.uri, categoryId, capture.width || 0, capture.height || 0);
      } catch (error) {
        showAlert({
          title: 'Error',
          message: 'Failed to save photo',
          variant: 'error',
        });
      }
    },
    [categoryId, savePhoto, showAlert]
  );

  const handleCameraSelection = useCallback(async () => {
    setModalVisible(false);
    const result = await handleCameraPress();
    if (result) {
      await saveCapturedPhoto(result);
    }
  }, [handleCameraPress, saveCapturedPhoto]);

  const handleGallerySelection = useCallback(async () => {
    setModalVisible(false);
    const result = await handleGalleryPress();
    if (result) {
      await saveCapturedPhoto(result);
    }
  }, [handleGalleryPress, saveCapturedPhoto]);

  return {
    loading,
    photos,
    modalVisible,
    openModal: () => setModalVisible(true),
    closeModal: () => setModalVisible(false),
    handleDeletePhoto,
    handleCameraSelection,
    handleGallerySelection,
  };
};
