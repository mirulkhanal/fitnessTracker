import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizeWorkoutDays } from '@/utils/workout-schedule-format';
import {
  DEFAULT_WORKOUT_SCHEDULE,
  type JsWeekday,
  type WorkoutSchedule,
} from '@/types/workout-schedule.types';

const STORAGE_KEY = '@fitnesstracker/workout_schedule';

type Listener = () => void;
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach(listener => listener());
};

const clampTime = (schedule: WorkoutSchedule): WorkoutSchedule => ({
  ...schedule,
  hour: Math.min(23, Math.max(0, Math.floor(schedule.hour))),
  minute: Math.min(59, Math.max(0, Math.floor(schedule.minute))),
  daysOfWeek: normalizeWorkoutDays(schedule.daysOfWeek),
});

const parseStored = (raw: string | null): WorkoutSchedule => {
  if (!raw) {
    return DEFAULT_WORKOUT_SCHEDULE;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<WorkoutSchedule>;
    return clampTime({
      enabled: Boolean(parsed.enabled),
      configured: Boolean(parsed.configured),
      hour: typeof parsed.hour === 'number' ? parsed.hour : DEFAULT_WORKOUT_SCHEDULE.hour,
      minute: typeof parsed.minute === 'number' ? parsed.minute : DEFAULT_WORKOUT_SCHEDULE.minute,
      daysOfWeek: Array.isArray(parsed.daysOfWeek)
        ? normalizeWorkoutDays(parsed.daysOfWeek)
        : DEFAULT_WORKOUT_SCHEDULE.daysOfWeek,
    });
  } catch {
    return DEFAULT_WORKOUT_SCHEDULE;
  }
};

let memorySchedule: WorkoutSchedule | null = null;

export const workoutScheduleService = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async getSchedule(): Promise<WorkoutSchedule> {
    if (memorySchedule) {
      return memorySchedule;
    }
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    memorySchedule = parseStored(raw);
    return memorySchedule;
  },

  async setSchedule(schedule: WorkoutSchedule): Promise<WorkoutSchedule> {
    const next = clampTime({ ...schedule, configured: true });
    memorySchedule = next;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    notify();
    return next;
  },

  /** Workout days used for streak when reminders are enabled. */
  async getStreakWorkoutDays(): Promise<JsWeekday[] | undefined> {
    const schedule = await this.getSchedule();
    if (!schedule.configured || schedule.daysOfWeek.length === 0) {
      return undefined;
    }
    return schedule.daysOfWeek;
  },
};
