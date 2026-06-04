import type { JsWeekday } from '@/types/workout-schedule.types';
import { toLocalDateString } from '@/utils/parse-timestamp';

const MAX_LOOKBACK_DAYS = 730;

/**
 * Calendar-day streak: consecutive local days with a photo ending on the latest photo day.
 */
export const calculateCalendarStreak = (
  photoDayStrings: string[],
  lastPhotoTimestampMs: number
): number => {
  if (photoDayStrings.length === 0) {
    return 0;
  }

  const photoDays = new Set(photoDayStrings);
  let currentStreak = 0;
  const checkDate = new Date(lastPhotoTimestampMs);
  checkDate.setHours(12, 0, 0, 0);

  for (let i = 0; i < MAX_LOOKBACK_DAYS; i += 1) {
    const checkString = toLocalDateString(checkDate.getTime());
    if (photoDays.has(checkString)) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return currentStreak;
};

/**
 * Workout-day streak: only days in `workoutDays` must have photos; rest days are skipped.
 * Example: Mon–Fri workout days + photos on those days → weekend does not break the streak.
 */
export const calculateWorkoutDayStreak = (
  photoDayStrings: string[],
  lastPhotoTimestampMs: number,
  workoutDays: JsWeekday[]
): number => {
  if (photoDayStrings.length === 0 || workoutDays.length === 0) {
    return 0;
  }

  const photoDays = new Set(photoDayStrings);
  const workoutDaySet = new Set(workoutDays);
  let currentStreak = 0;
  const checkDate = new Date(lastPhotoTimestampMs);
  checkDate.setHours(12, 0, 0, 0);

  for (let i = 0; i < MAX_LOOKBACK_DAYS; i += 1) {
    const weekday = checkDate.getDay() as JsWeekday;
    const checkString = toLocalDateString(checkDate.getTime());

    if (workoutDaySet.has(weekday)) {
      if (!photoDays.has(checkString)) {
        break;
      }
      currentStreak += 1;
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  return currentStreak;
};

export const shouldUseWorkoutDayStreak = (workoutDays: JsWeekday[] | undefined): boolean =>
  Boolean(workoutDays && workoutDays.length > 0);
