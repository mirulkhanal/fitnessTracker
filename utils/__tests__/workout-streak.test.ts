import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateCalendarStreak,
  calculateWorkoutDayStreak,
  shouldUseWorkoutDayStreak,
} from '../workout-streak';

test('calculateCalendarStreak counts consecutive days with photos', () => {
  const last = new Date('2026-06-04T12:00:00').getTime();
  const days = ['2026-06-04', '2026-06-03', '2026-06-02'];
  assert.equal(calculateCalendarStreak(days, last), 3);
});

test('calculateCalendarStreak stops at first gap', () => {
  const last = new Date('2026-06-04T12:00:00').getTime();
  const days = ['2026-06-04', '2026-06-02'];
  assert.equal(calculateCalendarStreak(days, last), 1);
});

test('calculateWorkoutDayStreak skips non-workout days', () => {
  const last = new Date('2026-06-06T12:00:00').getTime(); // Saturday — not a workout day
  const days = ['2026-06-05', '2026-06-04', '2026-06-03', '2026-06-02'];
  const weekdays = [1, 2, 3, 4, 5] as const;
  assert.equal(calculateWorkoutDayStreak(days, last, [...weekdays]), 4);
});

test('shouldUseWorkoutDayStreak requires configured days', () => {
  assert.equal(shouldUseWorkoutDayStreak([]), false);
  assert.equal(shouldUseWorkoutDayStreak([1, 3, 5]), true);
});
