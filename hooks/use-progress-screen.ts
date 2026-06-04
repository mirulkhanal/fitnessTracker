import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { useCategoriesStore } from '@/store/categories.store';
import { EMPTY_PROGRESS_PHOTOS, usePhotosStore } from '@/store/photos.store';
import type { ProgressViewMode, SlideshowSpeedKey } from '@/types/progress-view.types';
import { CategoryStats } from '@/types/category.types';
import { sortPhotosChronologically } from '@/utils/sort-progress-photos';

export const useProgressScreen = () => {
  const categoryStats = useCategoriesStore(state => state.categoryStats);
  const categoriesLoading = useCategoriesStore(state => state.statsLoading);
  const loadCategoryStats = useCategoriesStore(state => state.loadCategoryStats);
  const loadPhotos = usePhotosStore(state => state.loadPhotos);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ProgressViewMode>('timeline');
  const [slideshowSpeed, setSlideshowSpeed] = useState<SlideshowSpeedKey>('medium');

  const categoriesWithPhotos = useMemo(
    () => categoryStats.filter(category => category.photoCount > 0),
    [categoryStats]
  );

  const selectedCategory = useMemo(
    () => categoriesWithPhotos.find(category => category.id === selectedCategoryId) ?? null,
    [categoriesWithPhotos, selectedCategoryId]
  );

  const categoryPhotos = usePhotosStore(state =>
    selectedCategoryId
      ? (state.categoryPhotos[selectedCategoryId] ?? EMPTY_PROGRESS_PHOTOS)
      : EMPTY_PROGRESS_PHOTOS
  );

  const categoryPhotosLoading = usePhotosStore(state =>
    selectedCategoryId ? Boolean(state.categoryLoading[selectedCategoryId]) : false
  );

  const timelinePhotos = useMemo(
    () => sortPhotosChronologically(categoryPhotos),
    [categoryPhotos]
  );

  const refresh = useCallback(async () => {
    await loadCategoryStats();
    if (selectedCategoryId) {
      await loadPhotos(selectedCategoryId);
    }
  }, [loadCategoryStats, loadPhotos, selectedCategoryId]);

  useRefreshOnFocus(refresh, [refresh]);

  useEffect(() => {
    if (categoriesWithPhotos.length === 0) {
      setSelectedCategoryId(null);
      return;
    }
    const firstId = categoriesWithPhotos[0]?.id;
    if (!firstId) {
      return;
    }
    if (!selectedCategoryId || !categoriesWithPhotos.some(c => c.id === selectedCategoryId)) {
      setSelectedCategoryId(firstId);
    }
  }, [categoriesWithPhotos, selectedCategoryId]);

  useEffect(() => {
    if (!selectedCategoryId) {
      return;
    }
    void loadPhotos(selectedCategoryId);
  }, [loadPhotos, selectedCategoryId]);

  const selectCategory = useCallback((category: CategoryStats) => {
    setSelectedCategoryId(category.id);
  }, []);

  const loading = categoriesLoading || categoryPhotosLoading;

  return {
    categoriesWithPhotos,
    selectedCategory,
    selectedCategoryId,
    selectCategory,
    timelinePhotos,
    viewMode,
    setViewMode,
    slideshowSpeed,
    setSlideshowSpeed,
    loading,
    refresh,
  };
};
