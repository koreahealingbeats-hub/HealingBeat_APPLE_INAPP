import { useState, useEffect, useRef } from 'react';
import { PanResponder, Animated, Dimensions, Easing } from 'react-native';
import TrackPlayer, { Track } from 'react-native-track-player';
import { usePlayer } from '@/features/play-audio/model/usePlayer';
import { useDownload } from '@/features/download-track/model/useDownload';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UseFullPlayerProps {
  onClose: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
}

export const useFullPlayer = ({ onClose, onModalStateChange }: UseFullPlayerProps) => {
  const { activeTrack, isPlaying, togglePlayback, skipToNext, skipToPrevious, progress, seekTo } = usePlayer();
  const { downloadTrack, isTrackDownloaded, isDownloading, deleteTrack, progress: downloadProgress, totalSize: downloadTotalSize } = useDownload();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [localFileSize, setLocalFileSize] = useState<string>('0 MB');
  const [queue, setQueue] = useState<Track[]>([]);

  const swipeAnim = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const queueRef = useRef<Track[]>([]);

  const [dragPosition, setDragPosition] = useState(0);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Bottom Sheet Animation Values
  const downloadModalOpacity = useRef(new Animated.Value(0)).current;
  const downloadModalTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [isDownloadModalRendered, setIsDownloadModalRendered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    TrackPlayer.getQueue().then(q => {
      if (!isMounted) return;
      setQueue(q);
      queueRef.current = q;
      const index = q.findIndex(t => t.id === activeTrack?.id);
      if (index !== -1) {
        setCurrentIndex(index);
        currentIndexRef.current = index;
        swipeAnim.setValue(0);
      }
    });
    return () => { isMounted = false; };
  }, [activeTrack?.id]);

  useEffect(() => {
    if (isDownloadModalVisible && !isDownloading && activeTrack && isTrackDownloaded(activeTrack.id)) {
      closeDownloadModal();
    }
  }, [isDownloading, isTrackDownloaded, activeTrack?.id, isDownloadModalVisible]);

  // Bottom Sheet Animation Trigger
  useEffect(() => {
    if (isDownloadModalVisible) {
      setIsDownloadModalRendered(true);
      Animated.parallel([
        Animated.timing(downloadModalOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(downloadModalTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(downloadModalOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(downloadModalTranslateY, {
          toValue: SCREEN_HEIGHT,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        })
      ]).start(() => {
        setIsDownloadModalRendered(false);
      });
    }
  }, [isDownloadModalVisible]);

  const closeDownloadModal = () => {
    setIsDownloadModalVisible(false);
  };

  useEffect(() => {
    onModalStateChange?.(isDeleteModalVisible || isDownloadModalVisible || isQueueVisible);
  }, [isDeleteModalVisible, isDownloadModalVisible, isQueueVisible]);

  useEffect(() => {
    if (isQueueVisible) {
      TrackPlayer.getQueue().then(setQueue);
    }
  }, [isQueueVisible]);

  const handleDelete = async () => {
    if (!activeTrack) return;

    setIsDeleting(true);
    setDeleteProgress(0);

    const interval = setInterval(() => {
      setDeleteProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 80);

    setTimeout(async () => {
      await deleteTrack(activeTrack.id);
      setIsDeleting(false);
      setIsDeleteModalVisible(false);
      setDeleteProgress(0);
    }, 1000);
  };

  const horizontalPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        let dx = gestureState.dx;
        if (currentIndexRef.current === 0 && dx > 0) {
          dx = dx * 0.3;
        } else if (currentIndexRef.current === queueRef.current.length - 1 && dx < 0) {
          dx = dx * 0.3;
        }
        swipeAnim.setValue(dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = SCREEN_WIDTH * 0.3;
        const velocity = Math.abs(gestureState.vx);

        if (gestureState.dx > threshold || (gestureState.dx > 50 && velocity > 0.5)) {
          if (currentIndexRef.current > 0) {
            Animated.timing(swipeAnim, {
              toValue: SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: false,
            }).start(async () => {
              await skipToPrevious();
            });
          } else {
            Animated.spring(swipeAnim, { toValue: 0, useNativeDriver: false, bounciness: 0 }).start();
          }
        } else if (gestureState.dx < -threshold || (gestureState.dx < -50 && velocity > 0.5)) {
          if (currentIndexRef.current < queueRef.current.length - 1) {
            Animated.timing(swipeAnim, {
              toValue: -SCREEN_WIDTH,
              duration: 200,
              useNativeDriver: false,
            }).start(async () => {
              await skipToNext();
            });
          } else {
            Animated.spring(swipeAnim, { toValue: 0, useNativeDriver: false, bounciness: 0 }).start();
          }
        } else {
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  return {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    activeTrack,
    isPlaying,
    togglePlayback,
    progress,
    seekTo,
    downloadTrack,
    isTrackDownloaded,
    isDownloading,
    downloadProgress,
    downloadTotalSize,
    isDeleteModalVisible,
    setIsDeleteModalVisible,
    isDownloadModalVisible,
    setIsDownloadModalVisible,
    isQueueVisible,
    setIsQueueVisible,
    isLiked,
    setIsLiked,
    isDeleting,
    deleteProgress,
    localFileSize,
    queue,
    currentIndex,
    swipeAnim,
    isDownloadModalRendered,
    downloadModalOpacity,
    downloadModalTranslateY,
    closeDownloadModal,
    handleDelete,
    horizontalPanResponder,
    setDragPosition,
    setIsDraggingSlider,
  };
};
