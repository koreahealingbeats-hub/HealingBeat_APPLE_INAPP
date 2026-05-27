import { Platform, PermissionsAndroid } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * [시스템 권한 요청 핸들러]
 * 앱 사용에 필수적인 시스템 권한(알림)을 요청하는 함수입니다.
 * 
 * [주의] 건강 데이터(HealthKit) 권한은 여기서 처리하지 않고,
 * HealthKitManager나 HealthConnectManager에서 별도로 처리합니다.
 * 
 * @returns {Promise<boolean>} 모든 필수 권한이 허용되었는지 여부 (true/false)
 */
export const requestSystemPermissions = async (): Promise<boolean> => {
  try {
    // 안드로이드와 iOS는 권한 요청 방식이 다릅니다.
    if (Platform.OS === 'android') {
      // -----------------------------------------------------------------------
      // [Android 권한 요청]
      // -----------------------------------------------------------------------
      const permissionsToRequest: any[] = [];

      // [안드로이드 13 (API 33) 이상 대응]
      if (Platform.Version >= 33) {
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }

      if (permissionsToRequest.length === 0) return true;

      // 사용자에게 팝업을 띄워 권한을 요청합니다.
      const granted = await PermissionsAndroid.requestMultiple(permissionsToRequest);

      let notificationsGranted = true;
      if (Platform.Version >= 33) {
        notificationsGranted = granted[PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS] === PermissionsAndroid.RESULTS.GRANTED;
      }

      return notificationsGranted;

    } else {
      // -----------------------------------------------------------------------
      // [iOS 권한 요청]
      // -----------------------------------------------------------------------
      
      // 1. 알림 권한 요청 (음악 컨트롤 및 알림용)
      const notificationStatus = await Notifications.requestPermissionsAsync();
      
      return notificationStatus.status === 'granted';
    }
  } catch (error) {
    console.error('권한 요청 중 오류 발생:', error);
    return false; // 에러 발생 시 실패로 처리
  }
};
