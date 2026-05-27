import {
  HealthValue,
  HealthKitPermissions,
} from 'react-native-health';

// -----------------------------------------------------------------------------
// [모듈 불러오기 설명]
// 'import' 대신 'require'를 사용하는 이유:
// react-native-health 라이브러리는 오래된 방식(CommonJS)으로 만들어져 있어서,
// 최신 방식(ESM)인 'import'로 불러오면 호환성 문제로 에러가 발생할 수 있습니다.
// 따라서 'require'를 사용하여 안정적으로 모듈을 불러옵니다.
// -----------------------------------------------------------------------------
const AppleHealthKitModule = require('react-native-health');
const AppleHealthKit = AppleHealthKitModule.default || AppleHealthKitModule;

// -----------------------------------------------------------------------------
// [권한 설정 객체]
// HealthKit에 어떤 데이터에 접근할지 미리 정의합니다.
// iOS는 사용자의 건강 데이터 접근에 매우 엄격하므로, 읽기/쓰기 권한을 명확히 구분해야 합니다.
const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.Workout,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.Workout,
    ],
  },
};

export const HealthKitManager = {
  /**
   * [HealthKit 초기화 함수]
   * 이 함수는 앱이 처음 실행될 때(또는 권한이 필요할 때) 호출되어야 합니다.
   * 
   * 주요 역할:
   * 1. HealthKit 네이티브 모듈이 앱에 잘 연결되었는지 확인합니다.
   * 2. 사용자에게 "이 앱이 건강 데이터를 봐도 될까요?"라는 팝업(권한 요청)을 띄웁니다.
   * 
   * @returns {Promise<boolean>} 초기화 성공 여부 (true: 성공, false: 실패)
   */
  init: (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      // 1. 네이티브 모듈 연결 확인
      // React Native는 자바스크립트 코드와 네이티브(iOS) 코드가 다리로 연결되어 통신합니다.
      // 이 다리(Bridge)가 끊겨 있거나 모듈이 없으면 HealthKit 기능을 쓸 수 없습니다.
      if (!AppleHealthKit.initHealthKit) {
        console.error('[HealthKit] 오류: initHealthKit 함수를 찾을 수 없습니다. 네이티브 모듈 연결을 확인해주세요.');
        resolve(false); // 실패로 처리
        return;
      }
      
      // 2. 초기화 및 권한 요청 실행
      // initHealthKit 함수가 실행되면 iOS 시스템이 사용자에게 권한 허용 팝업을 띄웁니다.
      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        if (error) {
          // 초기화 중 에러가 발생한 경우 (예: 기기가 HealthKit을 지원하지 않음 등)
          console.log('[HealthKit] 초기화 실패:', error);
          resolve(false);
        } else {
          // 초기화 성공! 이제부터 심박수나 수면 데이터를 가져올 수 있습니다.
          console.log('[HealthKit] 초기화 성공');
          resolve(true);
        }
      });
    });
  },

  /**
   * 심박수 데이터 조회 함수
   * 지정된 날짜(기본값: 7일 전)부터 현재까지의 심박수 데이터를 가져옵니다.
   * 가장 최근의 심박수 데이터를 반환합니다.
   * @param {Date} [customStartDate] 조회 시작 날짜 (선택 사항)
   * @returns {Promise<{ value: number; date: string | null }>} 심박수 값과 측정 시간
   */
  getHeartRate: (customStartDate?: Date): Promise<{ value: number; date: string | null }> => {
    return new Promise((resolve) => {
      const options = {
        startDate: (customStartDate || new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)).toISOString(), // 기본값: 7일 전
      };
      
      AppleHealthKit.getHeartRateSamples(options, (err: Object, results: HealthValue[]) => {
        if (err) {
          resolve({ value: 0, date: null });
          return;
        }
        // 데이터가 있으면 가장 마지막(최신) 데이터 반환
        if (results && results.length > 0) {
          const latest = results[results.length - 1];
          resolve({ value: latest.value, date: latest.startDate });
        } else {
          resolve({ value: 0, date: null });
        }
      });
    });
  },

  /**
   * 수면 분석 데이터 조회 함수
   * 지난 7일간의 수면 데이터를 가져옵니다.
   * @returns {Promise<any[]>} 수면 데이터 배열
   */
  getSleepAnalysis: (): Promise<any[]> => {
    return Promise.resolve([]); // 권한 제거로 인해 빈 배열 반환
  },
};
