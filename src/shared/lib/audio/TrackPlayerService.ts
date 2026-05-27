// import TrackPlayer, { Event } from 'react-native-track-player';
const TrackPlayerModule = require('react-native-track-player');
const TrackPlayer = TrackPlayerModule.default || TrackPlayerModule;
const { Event } = TrackPlayerModule;

console.log('[TrackPlayerService] Module Loaded');

export const PlaybackService = async function() {
  console.log('[PlaybackService] Service started');
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('[PlaybackService] RemotePlay');
    TrackPlayer.play();
  });
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('[PlaybackService] RemotePause');
    TrackPlayer.pause();
  });
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event: { position: number }) => TrackPlayer.seekTo(event.position));
  
  // [RemoteDuck]
  // 전화가 오거나 다른 앱에서 소리가 날 때(내비게이션 등) 처리
  TrackPlayer.addEventListener(Event.RemoteDuck, async (e: { paused?: boolean; permanent?: boolean }) => {
    console.log('[PlaybackService] RemoteDuck', e);
    if (e.paused) {
      // 다른 소리가 나서 멈춰야 할 때 (예: 전화 옴)
      await TrackPlayer.pause();
    } else if (e.permanent) {
      // 영구적으로 멈춰야 할 때 (예: 다른 음악 앱 실행)
      await TrackPlayer.stop();
    } else {
      // 다시 재생해도 될 때 (예: 전화 끊음, 내비게이션 안내 종료)
      await TrackPlayer.play();
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackError, (error: any) => {
    console.error('[PlaybackService] Playback Error:', error);
  });
};
