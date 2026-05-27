import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import { getIsPaired } from 'react-native-watch-connectivity';
import { HealthConnectManager } from '@/shared/lib/health/HealthConnectManager';
import { HealthKitManager } from '@/shared/lib/health/HealthKitManager';

interface HeartRateData {
  value: number;
  date: string | null;
}

interface UseHeartRatePollerResult {
  isPolling: boolean;
  timeLeft: number;
  data: HeartRateData | null;
  error: string | null;
  stop: () => void;
  refetch: () => void;
}

/**
 * [심박수 폴링(Polling) 훅]
 * 주기적으로 심박수 데이터를 확인하거나, 웨어러블 기기의 데이터를 실시간에 가깝게 가져오기 위해 사용합니다.
 * 
 * 주요 기능:
 * 1. 실시간 폴링 시작 (startPolling): 데이터를 주기적으로 요청하여 확인합니다.
 * 2. 타임아웃 처리: 일정 시간 내에 데이터가 없으면 오류를 발생시킵니다.
 * 3. 연결 상태 확인 (iOS): 애플워치 페어링 여부를 즉시 확인합니다.
 */
export const useHeartRatePoller = (): UseHeartRatePollerResult => {
  const [isPolling, setIsPolling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [data, setData] = useState<HeartRateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // [Ref] 화면 렌더링 없이 타이머 ID를 저장하기 위해 useRef 사용
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);       // 폴링 주기 타이머
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);  // 남은 시간 카운트다운 타이머
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);            // 전체 타임아웃 타이머

  /**
   * [폴링 중지 함수]
   * 실행 중인 모든 타이머(폴링, 카운트다운, 타임아웃)를 정리하고 폴링 상태를 종료합니다.
   * 컴포넌트가 언마운트되거나 측정이 완료되었을 때 호출됩니다.
   */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPolling(false);
  }, []);

  /**
   * [최신 심박수 단건 조회]
   * 가장 최근(10분 이내)의 심박수 데이터를 HealthKit/HealthConnect에서 가져옵니다.
   */
  const fetchLatestHeartRate = useCallback(async () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    try {
      let result: HeartRateData = { value: 0, date: null };
      
      if (Platform.OS === 'android') {
        result = await HealthConnectManager.getHeartRate(tenMinutesAgo);
      } else if (Platform.OS === 'ios') {
        result = await HealthKitManager.getHeartRate(tenMinutesAgo);
      }

      return result;
    } catch (err) {
      console.error('[useHeartRatePoller] 데이터 조회 중 오류:', err);
      return { value: 0, date: null };
    }
  }, []);

  /**
   * [폴링 시작 함수]
   * 심박수 측정을 시작합니다.
   * 1. (iOS) 워치 연결 확인
   * 2. 초기 데이터 확인 (있으면 즉시 완료)
   * 3. 데이터가 없으면 주기적(3초)으로 폴링 시작
   * 4. 15초 타임아웃 설정
   */
  const startPolling = useCallback(async () => {
    // Reset state
    setError(null);
    setData(null);
    stopPolling(); // 기존 타이머 정리 후 시작
    setTimeLeft(timeLeft);

    // 0. 즉시 연결 확인 (iOS 전용)
    // 측정 시작 전에 워치가 연결되어 있는지 먼저 확인합니다.
    if (Platform.OS === 'ios') {
      try {
        const isPaired = await getIsPaired();
        if (!isPaired) {
          const errorMessage = '연결된 워치를 찾을 수 없습니다.\nApple Watch가 iPhone과 페어링되어 있는지 확인해주세요.';
          setError(errorMessage);
          Alert.alert('워치 연결 확인', errorMessage, [
            { text: '확인', onPress: () => console.log('Alert closed') }
          ]);
          setIsPolling(false);
          return;
        }
      } catch (err) {
        console.warn('[useHeartRatePoller] Failed to check pairing status:', err);
        // Continue to polling if check fails, as a fallback
      }
    }

    // 1. 초기 데이터 확인
    // 폴링 시작 전에 이미 최신 데이터가 있는지 확인합니다.
    const initialData = await fetchLatestHeartRate();

    // 검색된 데이터가 있다면 상태를 업데이트하고 종료 (폴링 안 함)
    if (initialData.value > 0) {
      setData(initialData);
      return;
    }

    // 2. 데이터가 없으면 폴링 시작
    setIsPolling(true);

    // 3. 타임아웃 설정 (기본 15초)
    // 15초 동안 데이터를 못 찾으면 오류 처리합니다.
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      const errorMessage = '심박수 데이터를 받아올 수 없습니다.\n웨어러블 기기(Apple Watch/Galaxy Watch)의 연결 상태와 배터리를 확인해주세요.';
      setError(errorMessage);
      Alert.alert('연결 확인 필요', errorMessage, [
        { text: '확인', onPress: () => console.log('Alert closed') }
      ]);
    }, timeLeft * 1000);

    // 4. 카운트다운 타이머 시작 (1초마다 남은 시간 감소)
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // 타임아웃에 의해 곧 정리되지만 안전하게 0 반환
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 5. 폴링 인터벌 시작 (3초마다 데이터 확인)
    pollIntervalRef.current = setInterval(async () => {
      console.log('[useHeartRatePoller] 새 데이터 확인 중...');
      const pollData = await fetchLatestHeartRate();

      if (pollData.value > 0) {
        console.log('[useHeartRatePoller] 새 데이터 발견!', pollData);
        setData(pollData);
        stopPolling(); // 성공 시 폴링 중지
      }
    }, 3000);

  }, [fetchLatestHeartRate, stopPolling, timeLeft]);

  // 컴포넌트 언마운트 시 정리 (Cleanup)
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return {
    isPolling,
    timeLeft,
    data,
    error,
    stop: stopPolling,
    refetch: startPolling,
  };
};
