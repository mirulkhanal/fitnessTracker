import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAlert } from '@/contexts/AlertContext';
import { workoutNotificationService } from '@/services/workout-notification.service';
import { workoutScheduleService } from '@/services/workout-schedule.service';
import { useStatsStore } from '@/store/stats.store';
import {
  DEFAULT_WORKOUT_SCHEDULE,
  type JsWeekday,
  type WorkoutSchedule,
} from '@/types/workout-schedule.types';
import { formatWorkoutScheduleSummary } from '@/utils/workout-schedule-format';

export const useWorkoutReminders = () => {
  const { showAlert } = useAlert();
  const refreshStats = useStatsStore(state => state.refreshStats);
  const [schedule, setSchedule] = useState<WorkoutSchedule>(DEFAULT_WORKOUT_SCHEDULE);
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(DEFAULT_WORKOUT_SCHEDULE.hour);
  const [minute, setMinute] = useState(DEFAULT_WORKOUT_SCHEDULE.minute);
  const [daysOfWeek, setDaysOfWeek] = useState<JsWeekday[]>(DEFAULT_WORKOUT_SCHEDULE.daysOfWeek);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDraftFromSchedule = useCallback((next: WorkoutSchedule) => {
    setSchedule(next);
    setEnabled(next.enabled);
    setHour(next.hour);
    setMinute(next.minute);
    setDaysOfWeek(next.daysOfWeek);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await workoutScheduleService.getSchedule();
      loadDraftFromSchedule(stored);
    } finally {
      setLoading(false);
    }
  }, [loadDraftFromSchedule]);

  useEffect(() => {
    void reload();
    return workoutScheduleService.subscribe(() => {
      void reload();
    });
  }, [reload]);

  const summary = useMemo(() => formatWorkoutScheduleSummary(schedule), [schedule]);

  const draftSchedule = useMemo<WorkoutSchedule>(
    () => ({
      enabled,
      configured: schedule.configured,
      hour,
      minute,
      daysOfWeek,
    }),
    [daysOfWeek, enabled, hour, minute, schedule.configured]
  );

  const canSave = useMemo(() => {
    if (!enabled) {
      return (
        schedule.enabled !== enabled ||
        schedule.hour !== hour ||
        schedule.minute !== minute ||
        schedule.daysOfWeek.join(',') !== daysOfWeek.join(',')
      );
    }
    if (daysOfWeek.length === 0) {
      return false;
    }
    return (
      schedule.enabled !== enabled ||
      schedule.hour !== hour ||
      schedule.minute !== minute ||
      schedule.daysOfWeek.join(',') !== daysOfWeek.join(',')
    );
  }, [daysOfWeek, enabled, hour, minute, schedule]);

  const toggleDay = useCallback((day: JsWeekday) => {
    setDaysOfWeek(current => {
      if (current.includes(day)) {
        return current.filter(d => d !== day);
      }
      return [...current, day].sort((a, b) => a - b);
    });
  }, []);

  const setWeekdaysPreset = useCallback(() => {
    setDaysOfWeek([1, 2, 3, 4, 5]);
  }, []);

  const setEveryDayPreset = useCallback(() => {
    setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
  }, []);

  const adjustHour = useCallback((delta: number) => {
    setHour(current => (current + delta + 24) % 24);
  }, []);

  const adjustMinute = useCallback((delta: number) => {
    setMinute(current => {
      const next = current + delta;
      if (next < 0) {
        return 59;
      }
      if (next > 59) {
        return 0;
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (enabled && daysOfWeek.length === 0) {
      showAlert({
        title: 'Select workout days',
        message: 'Choose at least one day for your reminder and streak.',
        variant: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      if (enabled) {
        const granted = await workoutNotificationService.requestPermissions();
        if (!granted) {
          showAlert({
            title: 'Notifications blocked',
            message:
              'Enable notifications for FitTrack Progress in your phone settings to receive workout reminders.',
            variant: 'warning',
          });
          return false;
        }
      }

      const next = await workoutScheduleService.setSchedule(draftSchedule);
      await workoutNotificationService.syncSchedule(next);
      loadDraftFromSchedule(next);
      await refreshStats();
      showAlert({
        title: 'Reminders saved',
        message: enabled
          ? 'You will get a notification on your workout days at the time you chose.'
          : 'Workout reminders are turned off.',
        variant: 'success',
      });
      return true;
    } catch (error) {
      showAlert({
        title: 'Could not save',
        message: error instanceof Error ? error.message : 'Unable to save workout reminders.',
        variant: 'error',
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    daysOfWeek.length,
    draftSchedule,
    enabled,
    loadDraftFromSchedule,
    refreshStats,
    showAlert,
  ]);

  return {
    loading,
    saving,
    summary,
    enabled,
    setEnabled,
    hour,
    minute,
    daysOfWeek,
    toggleDay,
    setWeekdaysPreset,
    setEveryDayPreset,
    adjustHour,
    adjustMinute,
    canSave,
    handleSave,
    reload,
  };
};
