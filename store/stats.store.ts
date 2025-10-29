import { ProgressStats } from '@/services/local-storage.service';
import { LoadingState } from '@/types/common.types';
import { create } from 'zustand';

interface StatsStore extends LoadingState {
  stats: ProgressStats;
  
  // Actions
  loadStats: () => Promise<void>;
  calculateValidStats: (validPhotos: any[]) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  stats: { 
    totalPhotos: 0, 
    currentStreak: 0 
  },
  loading: false,
  error: null,

  loadStats: async () => {
    set({ loading: true, error: null });
    try {
      const { localStorageService } = await import('@/services/local-storage.service');
      const statsData = await localStorageService.getStats();
      set({ stats: statsData, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load stats',
        loading: false 
      });
    }
  },

  calculateValidStats: async (validPhotos: any[]) => {
    try {
      // Get stats from localStorage service (which uses streak tracking)
      const { localStorageService } = await import('@/services/local-storage.service');
      const statsData = await localStorageService.getStats();
      
      // Update only the totalPhotos count based on valid photos
      // Keep the streak and lastPhotoDate from localStorage service
      const validStats = {
        ...statsData,
        totalPhotos: validPhotos.length,
      };
      
      set({ stats: validStats });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to calculate valid stats'
      });
    }
  },

  refreshStats: async () => {
    await get().loadStats();
  },
}));
