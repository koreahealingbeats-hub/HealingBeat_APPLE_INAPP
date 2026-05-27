import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect';

export const HealthConnectManager = {
  init: async (): Promise<boolean> => {
    try {
      console.log('[HealthConnect] Initializing...');
      
      const { getSdkStatus, SdkAvailabilityStatus } = require('react-native-health-connect');
      const status = await getSdkStatus();
      console.log('[HealthConnect] SDK Status:', status);
      
      if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        console.log('[HealthConnect] SDK 사용 불가. 상태:', status);
        if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
             console.log('[HealthConnect] 공급자 업데이트 필요.');
        }
        return false;
      }

      const isInitialized = await initialize();
      console.log('[HealthConnect] isInitialized:', isInitialized);
      
      if (!isInitialized) {
        console.log('[HealthConnect] Initialization failed. Health Connect might not be installed.');
        return false;
      }
      
      // Give the native side a moment to register its activity result launchers 
      // This prevents "lateinit property requestPermission has not been initialized" crashes
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('[HealthConnect] Requesting permissions...');
      const grantedPermissions = await requestPermission([
        { accessType: 'read', recordType: 'HeartRate' },
      ]);
      console.log('[HealthConnect] Granted permissions:', grantedPermissions);

      // 필수 권한(심박수)이 허용되었는지 확인
      const hasHeartRate = grantedPermissions.some(p => p.recordType === 'HeartRate' && p.accessType === 'read');

      if (!hasHeartRate) {
        console.log('[HealthConnect] Essential permissions denied.');
        return false;
      }

      return true;
    } catch (e) {
      console.log('[HealthConnect] Init Error:', e);
      return false;
    }
  },

  openHealthConnectSettings: () => {
    try {
      // openHealthConnectSettings(); // 라이브러리에서 내보내는 함수인지 확인 필요
      // 라이브러리에 없다면 Linking을 시도할 수 있습니다.
      const { openHealthConnectSettings } = require('react-native-health-connect');
      if (openHealthConnectSettings) {
        openHealthConnectSettings();
      }
    } catch (e) {
      console.log('[HealthConnect] Error opening settings:', e);
    }
  },

  getHeartRate: async (customStartTime?: Date): Promise<{ value: number; date: string | null }> => {
    try {
      const endTime = new Date();
      const startTime = customStartTime || new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000); // 기본값: 7일 전
      
      console.log('[HealthConnect] Fetching HeartRate...', { startTime, endTime });

      const result = await readRecords('HeartRate', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      });

      console.log(`[HealthConnect] HeartRate records found: ${result.records.length}`);

      if (result.records.length > 0) {
        // 최신순으로 정렬 (내림차순)
        const sorted = result.records.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        const latest = sorted[0];
        console.log('[HealthConnect] Latest HeartRate:', latest.samples[0].beatsPerMinute);
        return {
          value: latest.samples[0].beatsPerMinute,
          date: latest.startTime,
        };
      }
      console.log('[HealthConnect] No HeartRate records found.');
      return { value: 0, date: null };
    } catch (error) {
      console.error('[HealthConnect] Error reading HeartRate:', error);
      return { value: 0, date: null };
    }
  },

  getSleepSession: async (): Promise<any[]> => {
    return []; // 권한 제거로 인해 빈 배열 반환
  },
};
