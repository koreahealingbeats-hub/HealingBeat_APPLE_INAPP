import { useState, useEffect } from 'react';
import type { State as StateEnum, Event as EventEnum } from 'react-native-track-player';

const TrackPlayerModule = require('react-native-track-player');
const TrackPlayer = TrackPlayerModule.default || TrackPlayerModule;
const { useTrackPlayerEvents, Event, State, useProgress, useActiveTrack, usePlaybackState } = TrackPlayerModule;
import { SetupService } from '@/shared/lib/audio/SetupService';

/**
 * [플레이어 커스텀 훅 (Custom Hook)]
 * 이 파일은 뮤직 플레이어의 '리모컨'과 '상태 알림판' 역할을 하는 도구 모음입니다.
 * 
 * 컴포넌트(화면)에서는 복잡한 로직을 몰라도, 이 훅에서 제공하는 기능만 가져다 쓰면 됩니다.
 * 예: const { togglePlayback, isPlaying } = usePlayer();
 */
export const usePlayer = () => {
  // 플레이어 준비 상태 (초기화가 끝났는지)
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  // 현재 재생 상태 (재생 중, 일시정지, 버퍼링 등)
  const playbackStateObj = usePlaybackState();
  const playerState = playbackStateObj?.state || State.None;
  
  // [현재 곡 정보]
  // TrackPlayer가 제공하는 훅을 사용하여 현재 재생 중인 곡의 제목, 가수, 커버 이미지 등을 실시간으로 가져옵니다.
  const activeTrack = useActiveTrack();
  
  // [재생 진행률]
  // 현재 몇 초를 재생 중인지(position), 전체 길이는 몇 초인지(duration)를 실시간으로 알려줍니다.
  const progress = useProgress();

  useEffect(() => {
    /**
     * [초기화 실행]
     * 앱이 처음 켜질 때 딱 한 번 실행됩니다.
     * SetupService를 불러와서 플레이어 엔진을 시동 겁니다.
     */
    const setup = async () => {
      const isSetup = await SetupService();
      setIsPlayerReady(isSetup);
    };
    setup();
  }, []);

  // [이벤트 리스너] - PlaybackState 이벤트 대신 hook을 사용하여 실시간 동기화

  /**
   * [재생/일시정지 토글]
   * 버튼 하나로 재생과 일시정지를 번갈아가며 실행하는 함수입니다.
   */
  const togglePlayback = async () => {
    const currentTrack = await TrackPlayer.getActiveTrackIndex();
    if (currentTrack == null) {
      // 재생할 곡이 없으면 아무것도 하지 않습니다.
      return;
    }
    // 현재 재생 중이라면 -> 일시정지
    if (playerState === State.Playing) {
      await TrackPlayer.pause();
    } else {
      // 멈춰 있다면 -> 재생
      await TrackPlayer.play();
    }
  };

  // 다음 곡으로 넘기기
  const skipToNext = () => TrackPlayer.skipToNext();
  
  // 이전 곡으로 돌아가기
  const skipToPrevious = () => TrackPlayer.skipToPrevious();
  
  // 특정 위치로 이동하기 (예: 1분 30초 지점으로 점프)
  const seekTo = (position: number) => TrackPlayer.seekTo(position);
  
  // 플레이어 초기화 (모든 곡 제거 및 상태 리셋)
  const resetPlayer = async () => {
    await TrackPlayer.reset();
  };

  // 플레이어 음악을 일시정지하는 함수 (AI 카메라 진입 시 등 사용)
  const pausePlayer = async () => {
    // reset() 대신 pause()를 호출하여 대기열을 유지합니다.
    await TrackPlayer.pause();
  };

  // 외부에서 사용할 수 있도록 변수와 함수들을 포장해서 내보냅니다.
  return {
    isPlayerReady, // 플레이어가 준비되었나요?
    playerState,   // 현재 상태는 무엇인가요? (재생중/멈춤)
    activeTrack,   // 지금 나오는 노래 정보
    progress,      // 재생 시간 정보 (진행률)
    togglePlayback,// 재생/일시정지 버튼 기능
    skipToNext,    // 다음 곡 버튼 기능
    skipToPrevious,// 이전 곡 버튼 기능
    seekTo,        // 탐색 기능
    resetPlayer,   // 초기화 기능
    pausePlayer,   // 플레이어 일시정지
    isPlaying: playerState === State.Playing, // (편의용) 지금 재생 중인가요? (true/false)
  };
};
