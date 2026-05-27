import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { HealthKitManager } from '@/shared/lib/health/HealthKitManager';
import { HealthConnectManager } from '@/shared/lib/health/HealthConnectManager';


export const BPM_DATA_RANGE = 30;

/**
 * [건강 데이터 관리 훅 (Custom Hook)]
 * HealthKit(iOS) 및 HealthConnect(Android)와 연동하여 건강 데이터를 관리합니다.
 * 
 * 주요 기능:
 * 1. 기기별 건강 데이터 권한 초기화 (initHealth)
 * 2. 심박수 데이터 조회 (fetchHeartRate) - 최근 30일 데이터 기반
 * 3. 수면 데이터 조회 (fetchSleepData)
 * 4. 데이터 상태 관리 (준비 상태, 심박수, 마지막 업데이트 시간, 수면 데이터)
 */
export const useHealth = () => {
  // HealthKit/HealthConnect 초기화 완료 여부
  const [isReady, setIsReady] = useState(false);
  // 조회된 최신 심박수 (BPM)
  const [heartRate, setHeartRate] = useState(0);
  // 마지막으로 심박수를 측정한 시간
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  // 수면 분석 데이터 목록
  const [sleepData, setSleepData] = useState<any[]>([]);

  /**
   * [초기화 함수]
   * 플랫폼(iOS/Android)에 맞는 건강 데이터 매니저를 초기화하고 권한을 요청합니다.
   * 앱 실행 시 최초 1회 호출되어야 합니다.
   * @returns {Promise<boolean>} 초기화 성공 여부
   */
  const initHealth = async () => {
    let result = false;
    if (Platform.OS === 'ios') {
      result = await HealthKitManager.init();
    } else if (Platform.OS === 'android') {
      result = await HealthConnectManager.init();
    }
    setIsReady(result);
    return result;
  };

  /**
   * [심박수 조회 함수]
   * 저장소(HealthKit/HealthConnect)에서 최근 심박수 데이터를 가져옵니다.
   * 기본적으로 최근 30일 간의 데이터를 조회하여 가장 최신 값을 사용합니다.
   * @returns {Promise<number>} 최신 심박수 (BPM)
   */
  const fetchHeartRate = async () => {
    console.log('[useHealth] 심박수 조회 시작');
    let data = { value: 0, date: null as string | null };
    // 조회 범위: 최근 30일 (BPM_DATA_RANGE 참조)
    const thirtyDaysAgo = new Date(Date.now() - BPM_DATA_RANGE * 24 * 60 * 60 * 1000);
    
    if (Platform.OS === 'ios') {
      data = await HealthKitManager.getHeartRate(thirtyDaysAgo);
    } else if (Platform.OS === 'android') {
      data = await HealthConnectManager.getHeartRate(thirtyDaysAgo);
    }
    console.log('[useHealth] 조회된 심박수:', data);
    
    setHeartRate(data.value);
    setLastUpdated(data.date);
    return data.value;
  };

  /**
   * [수면 데이터 조회 함수]
   * 수면 분석 데이터를 가져와서 수면 리포트 차트에 사용할 상태를 업데이트합니다.
   * @returns {Promise<any[]>} 수면 데이터 배열
   */
  const fetchSleepData = async () => {
    // 권한 제거로 인해 빈 배열 반환
    const data: any[] = [];
    setSleepData(data);
    return data;
  };

  return {
    isReady,
    heartRate,
    lastUpdated,
    sleepData,
    initHealth,
    fetchHeartRate,
    fetchSleepData,
  };
};
