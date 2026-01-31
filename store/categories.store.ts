import { categoriesService } from '@/services/categories.service';
import { photosService } from '@/services/photos.service';
import { Category, CategoryStats, CreateCategoryRequest } from '@/types/category.types';
import { LoadingState } from '@/types/common.types';
import { ProgressImage } from '@/types/photo.types';
import { create } from 'zustand';

interface CategoriesStore extends LoadingState {
  categories: Category[];
  categoryStats: CategoryStats[];
  
  // Actions
  loadCategories: () => Promise<void>;
  loadCategoryStats: () => Promise<void>;
  createCategory: (request: CreateCategoryRequest) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  
  // Getters
  getCategoryById: (id: string) => Category | undefined;
  getCategoryStatsById: (id: string) => CategoryStats | undefined;
  getCategoriesWithPhotos: () => CategoryStats[];
}

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categories: [],
  categoryStats: [],
  loading: false,
  error: null,

  loadCategories: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await categoriesService.listCategories();
      set({ categories, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load categories',
        loading: false 
      });
    }
  },

  loadCategoryStats: async () => {
    set({ loading: true, error: null });
    try {
      let categories = get().categories;
      if (categories.length === 0) {
        categories = await categoriesService.listCategories();
        set({ categories });
      }
      let allImages: ProgressImage[] = [];
      try {
        allImages = await photosService.listPhotos();
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to load photos' });
      }
      
      const stats: CategoryStats[] = categories.map(category => {
        const categoryImages = allImages.filter(img => img.categories.includes(category.id));
        
        const lastPhotoDate = categoryImages.length > 0 
          ? Math.max(...categoryImages.map(img => img.timestamp))
          : undefined;
        
        return {
          ...category,
          photoCount: categoryImages.length,
          lastPhotoDate,
        };
      });

      set({ categoryStats: stats, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load category stats',
        loading: false 
      });
    }
  },

  createCategory: async (request: CreateCategoryRequest) => {
    set({ loading: true, error: null });
    try {
      const newCategory = await categoriesService.createCategory(request);
      
      set(state => ({
        categories: [...state.categories, newCategory],
        categoryStats: state.categoryStats.some(stat => stat.id === newCategory.id)
          ? state.categoryStats
          : [
              ...state.categoryStats,
              {
                ...newCategory,
                photoCount: 0,
                lastPhotoDate: undefined,
              },
            ],
        loading: false
      }));
      
      // Refresh stats after creating
      await get().loadCategoryStats();
      
      // Also refresh global stats
      const { useStatsStore } = await import('@/store/stats.store');
      const statsStore = useStatsStore.getState();
      await statsStore.loadStats();
      return newCategory;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create category';
      set({ 
        error: message,
        loading: false 
      });
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await categoriesService.deleteCategory(id);
      await photosService.removeCategoryFromPhotos(id);
      
      set(state => ({
        categories: state.categories.filter(cat => cat.id !== id),
        categoryStats: state.categoryStats.filter(stat => stat.id !== id),
        loading: false
      }));
      
      // Refresh stats after deleting
      await get().loadCategoryStats();
      
      // Also refresh global stats
      const { useStatsStore } = await import('@/store/stats.store');
      const statsStore = useStatsStore.getState();
      await statsStore.loadStats();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      set({ 
        error: message,
        loading: false 
      });
      throw error;
    }
  },

  updateCategory: async (id: string, updates: Partial<Category>) => {
    set({ loading: true, error: null });
    try {
      const updatedCategory = await categoriesService.updateCategory(id, updates);
      
      set(state => ({
        categories: state.categories.map(cat => 
          cat.id === id ? updatedCategory : cat
        ),
        loading: false
      }));
      
      // Refresh stats after updating
      await get().loadCategoryStats();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update category';
      set({ 
        error: message,
        loading: false 
      });
      throw error;
    }
  },

  getCategoryById: (id: string) => {
    return get().categories.find(cat => cat.id === id);
  },

  getCategoryStatsById: (id: string) => {
    return get().categoryStats.find(stat => stat.id === id);
  },

  getCategoriesWithPhotos: () => {
    return get().categoryStats.filter(stat => stat.photoCount > 0);
  },
}));
