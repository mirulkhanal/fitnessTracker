import { ProgressStats } from '@/types/progress.interface';
import { parseTimestampMs, toLocalDateString } from '@/utils/parse-timestamp';

import { dataMigrationService } from './data-migration.service';
import { wrAuthDataService } from './wrauth-data.service';

/**
 * Count consecutive calendar days (local timezone) with at least one photo,
 * ending on the day of the most recent photo.
 */
const calculateStreakFromDays = (streakDays: string[], lastPhotoTimestampMs: number) => {
  if (streakDays.length === 0) {
    return 0;
  }

  let currentStreak = 0;
  let checkDate = new Date(lastPhotoTimestampMs);
  const sortedDays = [...streakDays].sort((a, b) => b.localeCompare(a));

  for (const day of sortedDays) {
    const checkString = toLocalDateString(checkDate.getTime());

    if (day === checkString) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (day < checkString) {
      break;
    }
  }

  return currentStreak;
};

const getStats = async (): Promise<ProgressStats> => {
  await dataMigrationService.migrateLocalDataToWrAuthIfNeeded();
  const rows = await wrAuthDataService.listPhotoMetadata();

  const timestamps = rows
    .map(row => parseTimestampMs(row.captured_at))
    .filter(value => value > 0);

  const totalPhotos = timestamps.length;
  if (totalPhotos === 0) {
    return { totalPhotos: 0, currentStreak: 0 };
  }

  const lastPhotoDate = Math.max(...timestamps);
  const uniqueDays = new Set(timestamps.map(toLocalDateString));
  const currentStreak = calculateStreakFromDays(Array.from(uniqueDays), lastPhotoDate);

  return {
    totalPhotos,
    currentStreak,
    lastPhotoDate,
  };
};

export const statsService = {
  getStats,
};
