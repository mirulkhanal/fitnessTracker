/** JavaScript weekday: 0 = Sunday … 6 = Saturday */
export type JsWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WorkoutSchedule = {
  enabled: boolean;
  /** True after the user saves workout days at least once (drives streak rules). */
  configured: boolean;
  hour: number;
  minute: number;
  daysOfWeek: JsWeekday[];
};

export const DEFAULT_WORKOUT_SCHEDULE: WorkoutSchedule = {
  enabled: false,
  configured: false,
  hour: 9,
  minute: 0,
  daysOfWeek: [1, 2, 3, 4, 5],
};
