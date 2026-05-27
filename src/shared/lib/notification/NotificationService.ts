import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export const NotificationService = {
  requestPermissions: async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  scheduleAlarm: async (hour: number, minute: number, days: number[]) => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const trigger: Notifications.CalendarTriggerInput = {
      hour,
      minute,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "좋은 아침입니다!",
        body: "힐링비트와 함께 일어날 시간이에요.",
        sound: true,
      },
      trigger,
    });
  },

  cancelAll: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
