import { useState, useEffect, useRef } from 'react';
import { Alert, Platform, NativeModules } from 'react-native';
import { sendMessage, watchEvents, getIsPaired } from 'react-native-watch-connectivity';
import { HealthKitManager } from '@/shared/lib/health/HealthKitManager';

export const useHeartRateScreen = () => {
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'measuring' | 'received'>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Listen for messages from Watch
    const unsubscribeMessage = watchEvents.addListener('message', (message: any) => {
      if (message.heartRate) {
        setHeartRate(message.heartRate);
        setStatus('received');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    });
    
    // Listen for context updates from Watch (Background wakeup fallback)
    const unsubscribeContext = watchEvents.addListener('application-context', (context: any) => {
      if (context.heartRate) {
        setHeartRate(context.heartRate);
        setStatus('received');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeContext();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleStartMeasurement = async () => {
    // 1. 즉시 연결 확인 (iOS 전용)
    if (Platform.OS === 'ios') {
      const isPaired = await getIsPaired();
      if (!isPaired) {
        Alert.alert(
          '워치 연결 확인',
          '연결된 워치를 찾을 수 없습니다.\n웨어러블 기기와 페어링되어 있는지 확인해주세요.',
          [{ text: '확인' }]
        );
        return;
      }
    }

    setStatus('measuring');
    setHeartRate(null);
    sendMessage({ command: 'START_MEASUREMENT' });

    // 워치 앱 강제 실행 호출 (Workout Session 활용)
    if (Platform.OS === 'ios' && NativeModules.WatchLauncherModule) {
      try {
        // 권한 확실히 얻기
        await HealthKitManager.init();
        await NativeModules.WatchLauncherModule.startWatchApp();
        console.log('[WatchLauncher] Successfully launched Apple Watch app via WorkoutSession');
      } catch (error: any) {
        console.log('[WatchLauncher] Failed to launch watch app:', error);
        Alert.alert('워치 실행 실패', `워치 앱을 깨우지 못했습니다: ${error?.message || error}`);
      }
    }

    // 2. 타임아웃 설정 (15초)
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setStatus((prevStatus) => {
        if (prevStatus === 'measuring') {
          Alert.alert(
            '연결 확인 필요',
            '심박수 데이터를 받아올 수 없습니다.\n웨어러블 기기의 연결 상태와 배터리를 확인해주세요.',
            [{ text: '확인' }]
          );
          return 'idle';
        }
        return prevStatus;
      });
    }, 15000);
  };

  return {
    heartRate,
    status,
    handleStartMeasurement,
  };
};
