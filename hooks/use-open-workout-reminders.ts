import { useWorkoutRemindersUiStore } from '@/store/workout-reminders-ui.store';

export const useOpenWorkoutReminders = () => useWorkoutRemindersUiStore(state => state.open);
