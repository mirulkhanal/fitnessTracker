import { supabase } from '@/services/supabase.client';
import { ProgressStats } from '@/types/progress.interface';

const normalizeTimestamp = (value: number | string) => {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const toDateString = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
};

const calculateStreakFromDays = (streakDays: string[], startTimestamp: number) => {
  if (streakDays.length === 0) {
    return 0;
  }

  let currentStreak = 0;
  let checkDate = new Date(startTimestamp);
  const sortedDays = [...streakDays].sort((a, b) => b.localeCompare(a));

  for (const day of sortedDays) {
    const checkString = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(checkDate.getDate()).padStart(2, '0')}`;

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
  const { data, error } = await supabase
    .from('photo_metadata')
    .select('captured_at');

  if (error) {
    throw new Error(error.message);
  }

  const timestamps = (data ?? [])
    .map(row => normalizeTimestamp(row.captured_at))
    .filter(value => value > 0);

  const totalPhotos = timestamps.length;
  if (totalPhotos === 0) {
    return { totalPhotos: 0, currentStreak: 0 };
  }

  const lastPhotoDate = Math.max(...timestamps);
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const uniqueDays = new Set(timestamps.map(toDateString));
  const currentStreak =
    now - lastPhotoDate > twentyFourHours
      ? 0
      : calculateStreakFromDays(Array.from(uniqueDays), lastPhotoDate);

  return {
    totalPhotos,
    currentStreak,
    lastPhotoDate,
  };
};

export const statsService = {
  getStats,
};
