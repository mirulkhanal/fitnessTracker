import { Category, CategoryStats, CreateCategoryRequest } from '@/types/category.types';
import { LoadingState } from '@/types/common.types';
import { create } from 'zustand';

interface CategoriesStore extends LoadingState {
  categories: Category[];
  categoryStats: CategoryStats[];
  
  // Actions
  loadCategories: () => Promise<void>;
  loadCategoryStats: () => Promise<void>;
  createCategory: (request: CreateCategoryRequest) => Promise<void>;
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
      const { localStorageService } = await import('@/services/local-storage.service');
      const categories = await localStorageService.getAllCategories();
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
      const { localStorageService } = await import('@/services/local-storage.service');
      const [allImages, customCategories] = await Promise.all([
        localStorageService.getProgressImages(),
        localStorageService.getCustomCategories(), // Only get custom categories
      ]);
      
      // Get all unique category IDs from images
      const usedCategoryIds = new Set<string>();
      allImages.forEach(img => {
        const legacyImg = img as any;
        if (legacyImg.categories && Array.isArray(legacyImg.categories)) {
          legacyImg.categories.forEach((id: string) => usedCategoryIds.add(id));
        } else if (legacyImg.category) {
          usedCategoryIds.add(legacyImg.category);
        }
      });

      // Get default categories that are actually used
      const defaultCategories = [
        { id: 'default', name: 'Default', color: '#6B7280', icon: 'folder.fill' },
        { id: 'full-body', name: 'Full Body', color: '#4CAF50', icon: 'person.fill' },
        { id: 'abs', name: 'Abs', color: '#2196F3', icon: 'rectangle.fill' },
        { id: 'arms', name: 'Arms', color: '#FF9800', icon: 'hand.raised.fill' },
        { id: 'legs', name: 'Legs', color: '#9C27B0', icon: 'figure.walk' },
        { id: 'chest', name: 'Chest', color: '#F44336', icon: 'heart.fill' },
        { id: 'back', name: 'Back', color: '#607D8B', icon: 'figure.stand' },
      ].filter(cat => usedCategoryIds.has(cat.id) || cat.id === 'default');

      // Combine used default categories with custom categories
      const allCategories = [...defaultCategories, ...customCategories];
      
      const stats: CategoryStats[] = allCategories.map(category => {
        const categoryImages = allImages.filter(img => {
          const legacyImg = img as any;
          if (legacyImg.categories && Array.isArray(legacyImg.categories)) {
            return legacyImg.categories.includes(category.id);
          } else if (legacyImg.category) {
            return legacyImg.category === category.id;
          }
          return false;
        });
        
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
      const { localStorageService } = await import('@/services/local-storage.service');
      const newCategory: Category = {
        id: `custom_${Date.now()}`,
        name: request.name.trim(),
        color: request.color || '#6C7B7F',
        icon: request.icon,
      };

      await localStorageService.saveCustomCategory(newCategory);
      
      set(state => ({
        categories: [...state.categories, newCategory],
        loading: false
      }));
      
      // Refresh stats after creating
      await get().loadCategoryStats();
      
      // Also refresh global stats
      const { useStatsStore } = await import('@/store/stats.store');
      const statsStore = useStatsStore.getState();
      await statsStore.loadStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create category',
        loading: false 
      });
    }
  },

  deleteCategory: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { localStorageService } = await import('@/services/local-storage.service');
      await localStorageService.deleteCategory(id);
      
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
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete category',
        loading: false 
      });
    }
  },

  updateCategory: async (id: string, updates: Partial<Category>) => {
    set({ loading: true, error: null });
    try {
      const { localStorageService } = await import('@/services/local-storage.service');
      await localStorageService.updateCategory(id, updates);
      
      set(state => ({
        categories: state.categories.map(cat => 
          cat.id === id ? { ...cat, ...updates } : cat
        ),
        loading: false
      }));
      
      // Refresh stats after updating
      await get().loadCategoryStats();
      get().loadStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update category',
        loading: false 
      });
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
