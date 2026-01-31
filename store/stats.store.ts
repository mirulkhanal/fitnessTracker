import { statsService } from '@/services/stats.service';
import { LoadingState } from '@/types/common.types';
import { ProgressStats } from '@/types/progress.interface';
import { create } from 'zustand';

interface StatsStore extends LoadingState {
  stats: ProgressStats;
  
  // Actions
  loadStats: () => Promise<void>;
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
      const statsData = await statsService.getStats();
      set({ stats: statsData, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load stats',
        loading: false 
      });
    }
  },

  refreshStats: async () => {
    await get().loadStats();
  },
}));
