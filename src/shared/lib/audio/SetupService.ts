// -----------------------------------------------------------------------------
// [오디오 모듈 불러오기]
// TrackPlayer는 음악 재생을 담당하는 핵심 라이브러리입니다.
// 호환성을 위해 'require'를 사용하여 모듈을 가져옵니다.
// -----------------------------------------------------------------------------
const TrackPlayerModule = require('react-native-track-player');
const TrackPlayer = TrackPlayerModule.default || TrackPlayerModule;
const { AppKilledPlaybackBehavior, Capability, IOSCategory, IOSCategoryMode, IOSCategoryOptions } = TrackPlayerModule;

/**
 * [오디오 플레이어 설정 서비스]
 * 앱이 시작될 때 가장 먼저 실행되어야 하는 함수입니다.
 * 음악을 재생하기 위한 '엔진'을 켜고, 알림바(Notification) 설정을 담당합니다.
 * 
 * @returns {Promise<boolean>} 설정 성공 여부
 */
export const SetupService = async () => {
  let isSetup = false;
  try {
    console.log('[SetupService] Checking constants...');
    console.log('[SetupService] Capability:', Capability);
    console.log('[SetupService] IOSCategory:', IOSCategory);

    if (!Capability || !IOSCategory) {
      console.error('[SetupService] CRITICAL ERROR: Constants are undefined! Check imports.');
    }

    // 1. 플레이어 상태 확인
    // "혹시 이미 플레이어가 켜져 있나?" 확인합니다.
    // getActiveTrackIndex()를 호출했을 때 에러가 안 나면 이미 켜져 있는 것입니다.
    await TrackPlayer.getActiveTrackIndex();
    isSetup = true;
  } catch {
    try {
      // 2. 플레이어 초기화 (엔진 시동)
      // 플레이어가 꺼져 있다면 setupPlayer()로 초기화합니다.
      // iOS에서 백그라운드 재생을 위해 카테고리를 'Playback'으로 설정합니다.
      await TrackPlayer.setupPlayer({
        iosCategory: IOSCategory.Playback,
        iosCategoryMode: IOSCategoryMode.Default,
        iosCategoryOptions: [IOSCategoryOptions.AllowBluetooth, IOSCategoryOptions.AllowAirPlay],
      });
      console.log('[SetupService] 플레이어 초기화 완료');
      isSetup = true;
    } catch (e: any) {
      if (e.message?.includes('already been initialized')) {
        console.log('[SetupService] 플레이어가 이미 초기화되어 있습니다. (정상)');
        isSetup = true;
      } else {
        console.error('[SetupService] 설정 중 오류 발생:', e);
      }
    }
  }

  if (isSetup) {
    try {
      // 3. 플레이어 옵션 설정 (알림바, 잠금화면 컨트롤)
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
          Capability.JumpForward,
          Capability.JumpBackward,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToPrevious,
          Capability.SkipToNext,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToPrevious,
          Capability.SkipToNext,
        ],
        progressUpdateEventInterval: 2,
      });
      console.log('[SetupService] 옵션 설정 완료');
    } catch (e) {
      console.error('[SetupService] 옵션 설정 중 오류 발생:', e);
    }
  }
  return isSetup;
};
