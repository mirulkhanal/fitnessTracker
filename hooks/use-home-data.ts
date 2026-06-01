import { useCallback, useMemo, useState } from 'react';

import { useRefreshOnFocus } from '@/hooks/use-refresh-on-focus';
import { appService } from '@/services/app.service';
import { useCategoriesStore } from '@/store/categories.store';
import { usePhotosStore } from '@/store/photos.store';
import { useStatsStore } from '@/store/stats.store';

export interface LatestPhotoInfo {
  id: string;
  imageUri: string;
  categoryLabel: string;
  dateLabel: string;
}

export const useHomeData = () => {
  const { categories, loadCategories } = useCategoriesStore();
  const { getValidCategories, getLatestPhoto, loadPhotos, deletePhoto } = usePhotosStore();
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
      id: latestPhoto.id,
      imageUri: latestPhoto.uri,
      categoryLabel,
      dateLabel: new Date(latestPhoto.timestamp).toLocaleDateString(),
    };
  }, [categories, getValidCategories, latestPhoto]);

  const formatLastPhotoLabel = (timestamp?: number) => {
    if (!timestamp) {
      return 'Never';
    }
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays <= 7) {
      return `${diffDays} days ago`;
    }
    return date.toLocaleDateString();
  };

  return {
    categories,
    stats,
    latestPhoto: latestPhotoInfo,
    lastPhotoLabel: formatLastPhotoLabel(stats.lastPhotoDate),
    loading,
    deletePhoto,
    refresh,
  };
};
