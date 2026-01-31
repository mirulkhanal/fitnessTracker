import { useCallback, useEffect, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { useImagePickerModal } from '@/hooks/use-image-picker-modal';
import { usePhotosStore } from '@/store/photos.store';

export const useCategoryPhotoActions = (categoryId: string) => {
  const { showAlert } = useAlert();
  const { handleCameraPress, handleGalleryPress } = useImagePickerModal();
  const { loading, getPhotosByCategory, savePhoto, deletePhoto, loadPhotos } = usePhotosStore();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [categoryId, loadPhotos]);

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
              } catch (error) {
                showAlert({
                  title: 'Error',
                  message: 'Failed to delete photo',
                  variant: 'error',
                });
              }
            },
          },
        ],
      });
    },
    [deletePhoto, showAlert]
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
