import { ProgressStats } from '@/types/progress.interface';
import { toLocalDateString } from '@/utils/parse-timestamp';
import {
  calculateCalendarStreak,
  calculateWorkoutDayStreak,
  shouldUseWorkoutDayStreak,
} from '@/utils/workout-streak';

import { dataMigrationService } from './data-migration.service';
import { photosService } from './photos.service';
import { workoutScheduleService } from './workout-schedule.service';

const getStats = async (): Promise<ProgressStats> => {
  await dataMigrationService.migrateLocalDataToWrAuthIfNeeded();
  const timestamps = await photosService.listAvailablePhotoTimestamps();

  const totalPhotos = timestamps.length;
  if (totalPhotos === 0) {
    return { totalPhotos: 0, currentStreak: 0 };
  }

  const lastPhotoDate = Math.max(...timestamps);
  const photoDayStrings = timestamps.map(toLocalDateString);
  const workoutDays = await workoutScheduleService.getStreakWorkoutDays();
  const currentStreak = shouldUseWorkoutDayStreak(workoutDays)
    ? calculateWorkoutDayStreak(photoDayStrings, lastPhotoDate, workoutDays!)
    : calculateCalendarStreak(photoDayStrings, lastPhotoDate);

  return {
    totalPhotos,
    currentStreak,
    lastPhotoDate,
  };
};

export const statsService = {
  getStats,
};
