import { Dimensions } from 'react-native';
import { usePlayer } from '@/features/play-audio/model/usePlayer';

export const useMiniPlayer = () => {
  const { activeTrack, isPlaying, togglePlayback } = usePlayer();
  const { width: screenWidth } = Dimensions.get('window');

  // CustomTabBar의 확장되었을 때 크기와 동일하게 맞춤 (최대 450px)
  const playerWidth = Math.min(screenWidth * 0.8, 450);

  return {
    activeTrack,
    isPlaying,
    togglePlayback,
    playerWidth,
  };
};
