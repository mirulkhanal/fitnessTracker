import { useCallback, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { useImagePickerModal } from '@/hooks/use-image-picker-modal';
import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { EMPTY_PROGRESS_PHOTOS, usePhotosStore } from '@/store/photos.store';

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
  const photos = usePhotosStore(state =>
    categoryId
      ? (state.categoryPhotos[categoryId] ?? EMPTY_PROGRESS_PHOTOS)
      : EMPTY_PROGRESS_PHOTOS
  );
  const loading = usePhotosStore(state =>
    categoryId ? Boolean(state.categoryLoading[categoryId]) : false
  );
  const { savePhoto, deletePhoto, loadPhotos } = usePhotosStore();
  const [modalVisible, setModalVisible] = useState(false);

  const refresh = useCallback(async () => {
    if (!categoryId) {
      return;
    }
    await loadPhotos(categoryId);
  }, [categoryId, loadPhotos]);

  useRefreshOnFocus(refresh, [refresh]);

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
                if (categoryId) {
                  await loadPhotos(categoryId);
                }
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
      } catch {
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
