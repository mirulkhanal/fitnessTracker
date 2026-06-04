import { WEEKDAY_LABELS, WEEKDAY_ORDER, WEEKDAYS_MON_FRI } from '@/constants/workout-days';
import type { JsWeekday, WorkoutSchedule } from '@/types/workout-schedule.types';

export const formatReminderTime = (hour: number, minute: number): string => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

const sortedDayKey = (days: JsWeekday[]) => [...days].sort((a, b) => a - b).join(',');

export const formatWorkoutDaysSummary = (days: JsWeekday[]): string => {
  if (days.length === 0) {
    return 'No days selected';
  }
  if (days.length === 7) {
    return 'Every day';
  }
  const key = sortedDayKey(days);
  if (key === sortedDayKey(WEEKDAYS_MON_FRI)) {
    return 'Mon–Fri';
  }
  if (key === '0,6') {
    return 'Sat–Sun';
  }
  return [...days]
    .sort((a, b) => a - b)
    .map(day => WEEKDAY_LABELS[day])
    .join(', ');
};

export const formatWorkoutScheduleSummary = (schedule: WorkoutSchedule): string => {
  if (!schedule.enabled) {
    return 'Off';
  }
  if (schedule.daysOfWeek.length === 0) {
    return 'On · pick workout days';
  }
  return `${formatWorkoutDaysSummary(schedule.daysOfWeek)} · ${formatReminderTime(
    schedule.hour,
    schedule.minute
  )}`;
};

export const normalizeWorkoutDays = (days: number[]): JsWeekday[] => {
  const valid = new Set(WEEKDAY_ORDER);
  return [...new Set(days.filter((d): d is JsWeekday => valid.has(d as JsWeekday)))].sort(
    (a, b) => a - b
  );
};
