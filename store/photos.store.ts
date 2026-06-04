import { photosService } from '@/services/photos.service';
import { Category } from '@/types/category.types';
import { LoadingState } from '@/types/common.types';
import { ProgressImage } from '@/types/photo.types';
import { sortPhotosNewestFirst } from '@/utils/sort-progress-photos';
import { create } from 'zustand';

/** Stable empty list for Zustand selectors — never use `?? []` inline in hooks. */
export const EMPTY_PROGRESS_PHOTOS: ProgressImage[] = [];

interface PhotosStore extends LoadingState {
  /** All photos (home, global latest). */
  photos: ProgressImage[];
  /** Per-category cache so category screens do not overwrite home data. */
  categoryPhotos: Record<string, ProgressImage[]>;
  categoryLoading: Record<string, boolean>;

  loadPhotos: (categoryId?: string) => Promise<void>;
  savePhoto: (
    imageUri: string,
    categories: string | string[],
    width?: number,
    height?: number
  ) => Promise<ProgressImage>;
  deletePhoto: (id: string) => Promise<void>;

  getPhotosByCategory: (categoryId: string) => ProgressImage[];
  isCategoryLoading: (categoryId: string) => boolean;
  getLatestPhoto: () => ProgressImage | null;
  getValidCategories: (photo: ProgressImage, allCategories: Category[]) => string[];
}

const getCategoryIds = (photo: ProgressImage): string[] => {
  if (Array.isArray(photo.categories)) {
    return photo.categories;
  }

  const legacyPhoto = photo as unknown as { categories?: string[]; category?: string };
  if (Array.isArray(legacyPhoto.categories)) {
    return legacyPhoto.categories;
  }
  if (legacyPhoto.category) {
    return [legacyPhoto.category];
  }
  return [];
};

const upsertPhotoInList = (list: ProgressImage[], photo: ProgressImage): ProgressImage[] => {
  const next = list.filter(item => item.id !== photo.id);
  return sortPhotosNewestFirst([photo, ...next]);
};

const removePhotoFromList = (list: ProgressImage[], photoId: string): ProgressImage[] =>
  list.filter(item => String(item.id) !== String(photoId));

export const usePhotosStore = create<PhotosStore>((set, get) => ({
  photos: [],
  categoryPhotos: {},
  categoryLoading: {},
  loading: false,
  error: null,

  loadPhotos: async (categoryId?: string) => {
    if (categoryId) {
      set(state => ({
        categoryLoading: { ...state.categoryLoading, [categoryId]: true },
        error: null,
      }));
      try {
        const photos = sortPhotosNewestFirst(await photosService.listPhotos(categoryId));
        set(state => ({
          categoryPhotos: { ...state.categoryPhotos, [categoryId]: photos },
          categoryLoading: { ...state.categoryLoading, [categoryId]: false },
        }));
      } catch (error) {
        set(state => ({
          categoryLoading: { ...state.categoryLoading, [categoryId]: false },
          error: error instanceof Error ? error.message : 'Failed to load photos',
        }));
      }
      return;
    }

    const showGlobalLoader = get().photos.length === 0;
    if (showGlobalLoader) {
      set({ loading: true, error: null });
    }
    try {
      const photos = sortPhotosNewestFirst(await photosService.listPhotos());
      set({ photos, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load photos',
        loading: false,
      });
    }
  },

  savePhoto: async (imageUri: string, categories: string | string[], width: number = 0, height: number = 0) => {
    set({ error: null });
    try {
      const savedPhoto = await photosService.savePhoto(imageUri, categories, width, height);
      const categoryIds = getCategoryIds(savedPhoto);

      set(state => {
        const nextCategoryPhotos = { ...state.categoryPhotos };
        for (const id of categoryIds) {
          const existing = nextCategoryPhotos[id] ?? [];
          nextCategoryPhotos[id] = upsertPhotoInList(existing, savedPhoto);
        }
        return {
          photos: upsertPhotoInList(state.photos, savedPhoto),
          categoryPhotos: nextCategoryPhotos,
        };
      });

      const { useCategoriesStore } = await import('@/store/categories.store');
      void useCategoriesStore.getState().loadCategoryStats();

      const { useStatsStore } = await import('@/store/stats.store');
      void useStatsStore.getState().loadStats();

      return savedPhoto;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save photo',
      });
      throw error;
    }
  },

  deletePhoto: async (id: string) => {
    const photoId = String(id);
    set({ error: null });
    try {
      await photosService.deletePhoto(photoId);

      set(state => {
        const nextCategoryPhotos: Record<string, ProgressImage[]> = {};
        for (const [key, list] of Object.entries(state.categoryPhotos)) {
          nextCategoryPhotos[key] = removePhotoFromList(list, photoId);
        }
        return {
          photos: removePhotoFromList(state.photos, photoId),
          categoryPhotos: nextCategoryPhotos,
        };
      });

      const { useCategoriesStore } = await import('@/store/categories.store');
      void useCategoriesStore.getState().loadCategoryStats();

      const { useStatsStore } = await import('@/store/stats.store');
      void useStatsStore.getState().loadStats();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete photo',
      });
      throw error;
    }
  },

  getPhotosByCategory: (categoryId: string) => {
    return get().categoryPhotos[categoryId] ?? EMPTY_PROGRESS_PHOTOS;
  },

  isCategoryLoading: (categoryId: string) => {
    return get().categoryLoading[categoryId] ?? false;
  },

  getLatestPhoto: () => {
    const photos = get().photos;
    return photos.length > 0 ? photos[0] : null;
  },

  getValidCategories: (photo: ProgressImage, allCategories: Category[]) => {
    const categoryIds = getCategoryIds(photo);
    if (categoryIds.length === 0) {
      return [];
    }

    return categoryIds
      .map(categoryId => allCategories.find(cat => cat.id === categoryId))
      .filter((cat): cat is Category => Boolean(cat))
      .map(cat => cat.name);
  },
}));
