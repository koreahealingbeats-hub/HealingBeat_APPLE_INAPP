import { useEffect, useState } from 'react';
import { Platform, AppState, Linking } from 'react-native';
import { HealthConnectManager } from '@/shared/lib/health/HealthConnectManager';
import { HealthKitManager } from '@/shared/lib/health/HealthKitManager';
import * as Notifications from 'expo-notifications';

interface UsePermissionScreenProps {
  onFinish?: () => void;
  navigation?: any;
}

export const usePermissionScreen = ({ onFinish, navigation }: UsePermissionScreenProps) => {
  const [healthPermission, setHealthPermission] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);

  const checkPermissions = async () => {
    const { status: notifStatus } = await Notifications.getPermissionsAsync();
    setNotificationPermission(notifStatus === 'granted');

    if (Platform.OS !== 'android') {
      setHealthPermission(false); 
    }
  };

  useEffect(() => {
    checkPermissions();
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermissions();
      }
    });
    return () => subscription.remove();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationPermission(status === 'granted');

    if (Platform.OS === 'android') {
      const healthResult = await HealthConnectManager.init();
      setHealthPermission(healthResult);
    } else {
      const healthResult = await HealthKitManager.init();
      setHealthPermission(healthResult);
    }
    
    checkPermissions();
  };

  const openHealthSettings = () => {
    if (Platform.OS === 'android') {
      HealthConnectManager.openHealthConnectSettings();
    } else {
      Linking.openSettings();
    }
  };

  useEffect(() => {
    if (notificationPermission && (Platform.OS !== 'android' || healthPermission)) {
      if (onFinish) {
        onFinish();
      } else if (navigation) {
        navigation.goBack();
      }
    }
  }, [notificationPermission, healthPermission]);

  return {
    healthPermission,
    notificationPermission,
    requestPermissions,
    openHealthSettings,
  };
};
