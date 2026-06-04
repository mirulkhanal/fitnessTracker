import { useEffect, useRef } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { useCategoriesStore } from '@/store/categories.store';
import { usePhotosStore } from '@/store/photos.store';
import { useStatsStore } from '@/store/stats.store';

/** Surfaces Zustand store errors once per distinct message (avoids silent failures). */
export const useStoreErrorAlerts = () => {
  const { showAlert } = useAlert();
  const photosError = usePhotosStore(state => state.error);
  const categoriesError = useCategoriesStore(state => state.error);
  const statsError = useStatsStore(state => state.error);
  const lastShown = useRef<string | null>(null);

  useEffect(() => {
    const message = photosError ?? categoriesError ?? statsError;
    if (!message || message === lastShown.current) {
      return;
    }
    lastShown.current = message;
    showAlert({
      title: 'Could not load data',
      message,
      variant: 'error',
    });
  }, [categoriesError, photosError, showAlert, statsError]);
};
