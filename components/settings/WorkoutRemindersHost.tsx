import { WorkoutRemindersModal } from '@/components/settings/WorkoutRemindersModal';
import { useWorkoutReminders } from '@/hooks/use-workout-reminders';
import { useWorkoutRemindersUiStore } from '@/store/workout-reminders-ui.store';
import React from 'react';

export function WorkoutRemindersHost() {
  const visible = useWorkoutRemindersUiStore(state => state.visible);
  const close = useWorkoutRemindersUiStore(state => state.close);
  const reminders = useWorkoutReminders();

  return (
    <WorkoutRemindersModal
      visible={visible}
      loading={reminders.loading}
      saving={reminders.saving}
      enabled={reminders.enabled}
      hour={reminders.hour}
      minute={reminders.minute}
      daysOfWeek={reminders.daysOfWeek}
      canSave={reminders.canSave}
      onClose={close}
      onEnabledChange={reminders.setEnabled}
      onToggleDay={reminders.toggleDay}
      onWeekdaysPreset={reminders.setWeekdaysPreset}
      onEveryDayPreset={reminders.setEveryDayPreset}
      onAdjustHour={reminders.adjustHour}
      onAdjustMinute={reminders.adjustMinute}
      onSave={reminders.handleSave}
    />
  );
}
