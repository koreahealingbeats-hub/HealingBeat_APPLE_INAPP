import { useRef, useState } from 'react';
import { Animated, PanResponder } from 'react-native';
import { usePlaylistStore } from '@/entities/playlist/model/usePlaylistStore';
import { useTabScroll } from '@/shared/lib/context/TabScrollContext';
import { useBottomPadding } from '@/shared/lib/hooks/useBottomPadding';
import { useNavigation } from '@react-navigation/native';

const TrackPlayerModule = require('react-native-track-player');
const TrackPlayer = TrackPlayerModule.default || TrackPlayerModule;

export const usePlaylistManager = () => {
  const navigation = useNavigation<any>();
  const { playlist } = usePlaylistStore();
  const { handleScroll } = useTabScroll();
  const { bottomPadding } = useBottomPadding();

  const HEADER_HEIGHT = 370;
  const sheetY = useRef(new Animated.Value(HEADER_HEIGHT)).current;
  const lastY = useRef(HEADER_HEIGHT);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const scrollOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isCollapsed = lastY.current >= HEADER_HEIGHT;
        const isCurrentlyExpanded = lastY.current === 0;

        const isVerticalMove = Math.abs(gestureState.dy) > 5;
        if (!isVerticalMove) return false;

        if (isCollapsed) {
          return gestureState.dy < 0;
        }

        if (isCurrentlyExpanded) {
          return gestureState.dy > 0 && scrollOffset.current <= 0;
        }

        return true;
      },
      onPanResponderGrant: () => {
        setIsExpanded(false);
      },
      onPanResponderMove: (_, gestureState) => {
        let newY = lastY.current + gestureState.dy;
        
        if (newY < 0) {
          newY = newY * 0.2;
        } else if (newY > HEADER_HEIGHT) {
          const overshoot = newY - HEADER_HEIGHT;
          newY = HEADER_HEIGHT + overshoot * 0.2;
        }
        
        sheetY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        // @ts-ignore
        const currentY = sheetY._value;
        let targetY = HEADER_HEIGHT;

        const startedFromCollapsed = lastY.current >= HEADER_HEIGHT;
        const dragThreshold = 100;

        if (startedFromCollapsed) {
          if (gestureState.vy < -0.3 || currentY < HEADER_HEIGHT - dragThreshold) {
            targetY = 0;
          } else {
            targetY = HEADER_HEIGHT;
          }
        } else {
          if (gestureState.vy > 0.3 || currentY > dragThreshold) {
            targetY = HEADER_HEIGHT;
          } else {
            targetY = 0;
          }
        }

        Animated.spring(sheetY, {
          toValue: targetY,
          useNativeDriver: true,
          velocity: gestureState.vy,
          tension: 40,
          friction: 8,
        }).start(() => {
          lastY.current = targetY;
          const nextExpanded = targetY === 0;
          setIsExpanded(nextExpanded);
          
          if (!nextExpanded) {
            scrollViewRef.current?.scrollTo({ y: 0, animated: false });
            scrollOffset.current = 0;
          }
        });
      },
    })
  ).current;

  const handleScrollViewScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollOffset.current = y;
    if (handleScroll) {
      handleScroll(event);
    }
  };

  const playTrack = async (index: number) => {
    try {
      const selectedTrack = playlist[index];
      if (!selectedTrack) return;

      await TrackPlayer.reset();
      await TrackPlayer.add(playlist);
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
    } catch (e) {
      console.error('[PlaylistManager] Error playing track:', e);
    }
  };

  return {
    navigation,
    playlist,
    bottomPadding,
    HEADER_HEIGHT,
    sheetY,
    isExpanded,
    scrollViewRef,
    panResponder,
    handleScrollViewScroll,
    playTrack,
  };
};
