import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { jsDayToExpoWeekday } from '@/constants/workout-days';
import { workoutScheduleService } from '@/services/workout-schedule.service';
import type { JsWeekday, WorkoutSchedule } from '@/types/workout-schedule.types';

const ANDROID_CHANNEL_ID = 'workout-reminders';
const NOTIFICATION_PREFIX = 'fittrack-workout-';

const notificationIdentifier = (jsWeekday: JsWeekday) => `${NOTIFICATION_PREFIX}${jsWeekday}`;

const configureHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Workout reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
};

const cancelWorkoutReminders = async () => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const ids = scheduled
    .map(entry => entry.identifier)
    .filter(id => id.startsWith(NOTIFICATION_PREFIX));
  await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id)));
};

const scheduleForDay = async (jsWeekday: JsWeekday, schedule: WorkoutSchedule) => {
  const expoWeekday = jsDayToExpoWeekday(jsWeekday);
  const identifier = notificationIdentifier(jsWeekday);

  const trigger =
    Platform.OS === 'ios'
      ? {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday: expoWeekday,
          hour: schedule.hour,
          minute: schedule.minute,
          repeats: true,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: expoWeekday,
          hour: schedule.hour,
          minute: schedule.minute,
          repeats: true,
          channelId: ANDROID_CHANNEL_ID,
        };

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: 'Workout reminder',
      body: 'Time to capture your progress photo and keep your streak going.',
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
    trigger: trigger as Notifications.NotificationTriggerInput,
  });
};

export const workoutNotificationService = {
  async initialize(): Promise<void> {
    configureHandler();
    await ensureAndroidChannel();
  },

  async requestPermissions(): Promise<boolean> {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) {
      return true;
    }
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });
    return requested.granted;
  },

  async syncSchedule(schedule: WorkoutSchedule): Promise<void> {
    await cancelWorkoutReminders();
    if (!schedule.enabled || schedule.daysOfWeek.length === 0) {
      return;
    }

    for (const jsWeekday of schedule.daysOfWeek) {
      await scheduleForDay(jsWeekday, schedule);
    }
  },

  async syncFromStorage(): Promise<void> {
    const schedule = await workoutScheduleService.getSchedule();
    await this.syncSchedule(schedule);
  },
};
