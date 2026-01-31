import { photosService } from '@/services/photos.service';
import { Category } from '@/types/category.types';
import { LoadingState } from '@/types/common.types';
import { ProgressImage } from '@/types/photo.types';
import { create } from 'zustand';

interface PhotosStore extends LoadingState {
  photos: ProgressImage[];
  
  // Actions
  loadPhotos: (categoryId?: string) => Promise<void>;
  savePhoto: (imageUri: string, categories: string | string[], width?: number, height?: number) => Promise<ProgressImage>;
  deletePhoto: (id: string) => Promise<void>;
  
  // Getters
  getPhotosByCategory: (categoryId: string) => ProgressImage[];
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

export const usePhotosStore = create<PhotosStore>((set, get) => ({
  photos: [],
  loading: false,
  error: null,

  loadPhotos: async (categoryId?: string) => {
    set({ loading: true, error: null });
    try {
      const photos = await photosService.listPhotos(categoryId);
      set({ photos, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load photos',
        loading: false 
      });
    }
  },

  savePhoto: async (imageUri: string, categories: string | string[], width: number = 0, height: number = 0) => {
    set({ loading: true, error: null });
    try {
      const savedPhoto = await photosService.savePhoto(imageUri, categories, width, height);
      
      set(state => ({
        photos: [savedPhoto, ...state.photos],
        loading: false
      }));
      
      const { useCategoriesStore } = await import('@/store/categories.store');
      const categoriesStore = useCategoriesStore.getState();
      await categoriesStore.loadCategoryStats();

      // Trigger stats refresh by importing and calling the stats store
      const { useStatsStore } = await import('@/store/stats.store');
      const statsStore = useStatsStore.getState();
      await statsStore.loadStats();
      
      return savedPhoto;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save photo',
        loading: false 
      });
      throw error;
    }
  },

  deletePhoto: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await photosService.deletePhoto(id);
      
      set(state => ({
        photos: state.photos.filter(photo => photo.id !== id),
        loading: false
      }));
      
      const { useCategoriesStore } = await import('@/store/categories.store');
      const categoriesStore = useCategoriesStore.getState();
      await categoriesStore.loadCategoryStats();

      // Trigger stats refresh
      const { useStatsStore } = await import('@/store/stats.store');
      const statsStore = useStatsStore.getState();
      await statsStore.loadStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete photo',
        loading: false 
      });
    }
  },

  getPhotosByCategory: (categoryId: string) => {
    return get().photos.filter(photo => {
      return getCategoryIds(photo).includes(categoryId);
    });
  },

  getLatestPhoto: () => {
    const photos = get().photos;
    return photos.length > 0 ? photos[0] : null;
  },

  getValidCategories: (photo: ProgressImage, allCategories: Category[]) => {
    const categoryIds = getCategoryIds(photo);
    if (categoryIds.length === 0) return [];
    
    return categoryIds
      .map(categoryId => allCategories.find(cat => cat.id === categoryId))
      .filter((cat): cat is Category => Boolean(cat))
      .map(cat => cat.name);
  },
}));
