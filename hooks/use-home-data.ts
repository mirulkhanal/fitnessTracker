import { useCallback, useMemo, useState } from 'react';

import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { appService } from '@/services/app.service';
import { useCategoriesStore } from '@/store/categories.store';
import { usePhotosStore } from '@/store/photos.store';
import { useStatsStore } from '@/store/stats.store';

interface LatestPhotoInfo {
  imageUri: string;
  categoryLabel: string;
  dateLabel: string;
}
export const useHomeData = () => {
  const { categories, loadCategories } = useCategoriesStore();
  const { getValidCategories, getLatestPhoto, loadPhotos } = usePhotosStore();
  const { stats, loadStats } = useStatsStore();
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await appService.waitForInitialization();
      await Promise.all([loadPhotos(), loadCategories(), loadStats()]);
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadPhotos, loadStats]);

  useRefreshOnFocus(refresh, [refresh]);

  const latestPhoto = getLatestPhoto();

  const latestPhotoInfo: LatestPhotoInfo | null = useMemo(() => {
    if (!latestPhoto) return null;
    const categoryLabel = getValidCategories(latestPhoto, categories).join(', ') || 'Uncategorized';
    return {
      imageUri: latestPhoto.uri,
      categoryLabel,
      dateLabel: new Date(latestPhoto.timestamp).toLocaleDateString(),
    };
  }, [categories, getValidCategories, latestPhoto]);

  return {
    categories,
    stats,
    latestPhoto: latestPhotoInfo,
    loading,
  };
};
