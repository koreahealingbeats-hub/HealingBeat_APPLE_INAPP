import { useEffect, useState } from 'react';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useWindowDimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { useHealth } from '@/entities/health/model/useHealth';
import { useNetworkStore } from '@/entities/network/model/useNetworkStore';
import { usePlaylistStore } from '@/entities/playlist/model/usePlaylistStore';
import { useDownload } from '@/features/download-track/model/useDownload';
import { useBottomPadding } from '@/shared/lib/hooks/useBottomPadding';
import { useTabScroll } from '@/shared/lib/context/TabScrollContext';
import { requestSystemPermissions } from '@/shared/lib/utils/permissionHandler';
import TrackPlayer, { Track } from 'react-native-track-player';

export const useHomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { handleScroll } = useTabScroll();
  const { bottomPadding } = useBottomPadding();
  const { isReady, heartRate, lastUpdated, sleepData, initHealth, fetchHeartRate, fetchSleepData } = useHealth();
  const { isConnected } = useNetworkStore();
  const { downloadedTracks, isOfflineSimulated } = usePlaylistStore();
  const { downloadTrack, isDownloading, progress, isTrackDownloaded } = useDownload();
  const [refreshing, setRefreshing] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const isOffline = !isConnected || isOfflineSimulated;
  const isSampleDownloaded = (id: string) => isTrackDownloaded(id);

  const { width } = useWindowDimensions();
  const ITEM_WIDTH = Math.min(width * 0.72, 380);

  useEffect(() => {
    const initialize = async () => {
      // 1. 시스템 권한 요청
      await requestSystemPermissions();

      // iOS 연속 권한 요청 씹힘 방지를 위한 대기시간
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. 건강 데이터 자동 불러오기
      try {
        const hasPermission = await initHealth();
        if (hasPermission) {
          await fetchHeartRate();
        }
      } catch (e) {
        console.log('초기 데이터 로드 중 오류 발생:', e);
      }
    };
    initialize();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const hasPermission = await initHealth();
    if (!hasPermission) {
      setRefreshing(false);
      (navigation as any).navigate('PermissionScreen');
      return;
    }

    const bpm = await fetchHeartRate();
    setRefreshing(false);

    if (bpm > 0) {
      Toast.show({
        type: 'success',
        text1: '심박수 데이터가 갱신되었습니다.',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  const handlePlayQueue = async (track: Track, playlist: Track[]) => {
    try {
      await TrackPlayer.reset();

      const sanitizedPlaylist = playlist.map(t => {
        const isLocal = t.url && typeof t.url === 'string' && !t.url.startsWith('http');
        if (isLocal) {
          const fileName = `${(t as any).id}.mp3`;
          const currentPath = require('@/shared/lib/audio/DownloadManager').default.getPlayerPath(fileName);
          return { ...t, url: currentPath };
        }
        return t;
      });

      await TrackPlayer.add(sanitizedPlaylist);

      const index = sanitizedPlaylist.findIndex(t => (t as any).id === (track as any).id);
      if (index !== -1) {
        await TrackPlayer.skip(index);
      }
      await TrackPlayer.play();
    } catch (error) {
      console.error('Error playing playlist:', error);
    }
  };

  const handleNavigateToHeartRate = () => {
    // (navigation as any).navigate('HeartRateScreen');
    (navigation as any).navigate('AiCameraGuideScreen');

  };

  const handleSelectMeasurementMethod = (method: string) => {
    if (method === 'AI Camera') {
      (navigation as any).navigate('AiCameraGuideScreen');
    } else {
      (navigation as any).navigate('SleepMode');
    }
  };

  return {
    isFocused,
    handleScroll,
    bottomPadding,
    heartRate,
    lastUpdated,
    downloadedTracks,
    isOffline,
    refreshing,
    onRefresh,
    downloadTrack,
    isDownloading,
    isTrackDownloaded,
    handlePlayQueue,
    handleNavigateToHeartRate,
    handleSelectMeasurementMethod,
  };
};
