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
  getValidCategories: (photo: ProgressImage, allCategories: any[]) => string[];
}

export const usePhotosStore = create<PhotosStore>((set, get) => ({
  photos: [],
  loading: false,
  error: null,

  loadPhotos: async (categoryId?: string) => {
    set({ loading: true, error: null });
    try {
      const { localStorageService } = await import('@/services/local-storage.service');
      const photos = await localStorageService.getProgressImages(categoryId);
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
      const { localStorageService } = await import('@/services/local-storage.service');
      const savedPhoto = await localStorageService.saveProgressImage(
        imageUri,
        categories,
        width,
        height
      );
      
      set(state => ({
        photos: [savedPhoto, ...state.photos],
        loading: false
      }));
      
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
      const { localStorageService } = await import('@/services/local-storage.service');
      await localStorageService.deleteProgressImage(id);
      
      set(state => ({
        photos: state.photos.filter(photo => photo.id !== id),
        loading: false
      }));
      
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
      const legacyImg = photo as any;
      if (legacyImg.categories && Array.isArray(legacyImg.categories)) {
        return legacyImg.categories.includes(categoryId);
      } else if (legacyImg.category) {
        return legacyImg.category === categoryId;
      }
      return false;
    });
  },

  getLatestPhoto: () => {
    const photos = get().photos;
    return photos.length > 0 ? photos[0] : null;
  },

  getValidCategories: (photo: ProgressImage, allCategories: any[]) => {
    if (!photo.categories || photo.categories.length === 0) return [];
    
    return photo.categories
      .map(categoryId => allCategories.find(cat => cat.id === categoryId))
      .filter(Boolean)
      .map(cat => cat.name);
  },
}));
