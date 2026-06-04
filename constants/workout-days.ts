import type { JsWeekday } from '@/types/workout-schedule.types';

export const WEEKDAY_ORDER: JsWeekday[] = [0, 1, 2, 3, 4, 5, 6];

export const WEEKDAY_LABELS: Record<JsWeekday, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

export const WEEKDAY_LABELS_LONG: Record<JsWeekday, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export const WEEKDAYS_MON_FRI: JsWeekday[] = [1, 2, 3, 4, 5];

export const jsDayToExpoWeekday = (jsDay: JsWeekday): number => jsDay + 1;
