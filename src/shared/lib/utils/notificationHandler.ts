import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false, // 포그라운드에서는 소리 알림 끄기 (사용자 요청)
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

export const scheduleCompletionNotification = async (seconds: number) => {
  // 과거 시간이나 즉시 실행(0)인 경우 예약하지 않음
  if (seconds <= 0) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "집중 모드 종료",
      body: "설정한 시간이 다 되었습니다. 휴식을 취하세요.",
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: seconds === null ? null : { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: seconds,
        repeats: false
    },
  });
};

export const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};
