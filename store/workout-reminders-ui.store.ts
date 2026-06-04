import { create } from 'zustand';

type WorkoutRemindersUiStore = {
  visible: boolean;
  open: () => void;
  close: () => void;
};

export const useWorkoutRemindersUiStore = create<WorkoutRemindersUiStore>(set => ({
  visible: false,
  open: () => set({ visible: true }),
  close: () => set({ visible: false }),
}));
