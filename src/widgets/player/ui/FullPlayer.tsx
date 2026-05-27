import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, Pressable, ScrollView, Platform, Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './FullPlayer.styles';
import { UnifiedSlider } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import TrackPlayer from 'react-native-track-player';
import { Image } from 'expo-image';
import { useFullPlayer } from '../model/useFullPlayer';

export const FullPlayer = ({
  onClose,
  onModalStateChange
}: {
  onClose: () => void;
  onModalStateChange?: (isOpen: boolean) => void;
}) => {
  const insets = useSafeAreaInsets();
  const {
    SCREEN_WIDTH,
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
  } = useFullPlayer({ onClose, onModalStateChange });

  if (!activeTrack) return null;

  const isDownloaded = isTrackDownloaded(activeTrack.id);

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[
          styles.backgroundStrip,
          {
            transform: [{
              translateX: Animated.add(swipeAnim, -SCREEN_WIDTH)
            }]
          }
        ]}>
          <View style={styles.backgroundSlot}>
            {currentIndex > 0 && queue[currentIndex - 1] && (
              <Image
                source={{ uri: queue[currentIndex - 1].artwork || 'https://via.placeholder.com/600' }}
                style={styles.stackBackground}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={0}
              />
            )}
            <View style={styles.overlay} />
          </View>

          <View style={styles.backgroundSlot}>
            {queue[currentIndex] && (
              <Image
                source={{ uri: queue[currentIndex].artwork || 'https://via.placeholder.com/600' }}
                style={styles.stackBackground}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={0}
              />
            )}
            <View style={styles.overlay} />
          </View>

          <View style={styles.backgroundSlot}>
            {currentIndex < queue.length - 1 && queue[currentIndex + 1] && (
              <Image
                source={{ uri: queue[currentIndex + 1].artwork || 'https://via.placeholder.com/600' }}
                style={styles.stackBackground}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={0}
              />
            )}
            <View style={styles.overlay} />
          </View>
        </Animated.View>
      </View>

      <View style={[styles.safeArea, {
        paddingTop: insets.top || 40,
        paddingBottom: Math.max(insets.bottom, 40),
        paddingHorizontal: 20
      }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsQueueVisible(true)}
          >
            <Ionicons name="stats-chart" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (isDownloaded) {
                setIsDeleteModalVisible(true);
              } else {
                setIsDownloadModalVisible(true);
              }
            }}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={isDownloaded ? "checkmark" : "download-outline"}
                size={22}
                color={isDownloaded ? "#4CAF50" : "#fff"}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setIsLiked(!isLiked)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={22}
              color={isLiked ? "#FF6B6B" : "#fff"}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{ flex: 1 }}
          {...horizontalPanResponder.panHandlers}
        />

        <View style={styles.bottomSection}>
          <View style={styles.titleArea}>
            <View style={styles.textContainer}>
              <Text style={styles.artist}>{activeTrack.artist || 'Healing Beat'}</Text>
              <Text style={styles.title}>{activeTrack.title}</Text>
            </View>

            <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.sliderContainer}>
              <UnifiedSlider
                value={progress.position}
                minimumValue={0}
                maximumValue={progress.duration}
                onValueChange={(v: number) => {
                  setDragPosition(v);
                  setIsDraggingSlider(true);
                }}
                onSlidingComplete={(v: number) => {
                  seekTo(v);
                  setIsDraggingSlider(false);
                }}
                minimumTrackTintColor="#fff"
                maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
                thumbTintColor="#fff"
                duration={progress.duration}
                showBubble={true}
              />
            </View>
          </View>
        </View>
      </View>


      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isDeleting && setIsDeleteModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay}>
          <Pressable
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>
              {isDeleting ? '음원 삭제 중...' : '음원을 삭제하시겠습니까?'}
            </Text>

            {!isDeleting ? (
              <Text style={styles.modalSubtitle}>
                삭제하면 오프라인에서 재생할 수 없습니다.{"\n"}
                (용량: {localFileSize})
              </Text>
            ) : (
              <View style={styles.progressWrapper}>
                <Text style={styles.sizeText}>파일 용량: {localFileSize}</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${deleteProgress}%` }]} />
                </View>
                <Text style={styles.sizeText}>{deleteProgress}% 삭제 중</Text>
              </View>
            )}

            <View style={styles.modalButtonContainer}>
              {!isDeleting ? (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={handleDelete}
                  >
                    <Text style={styles.buttonText}>삭제</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setIsDeleteModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>확인</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isDownloadModalRendered}
        transparent={true}
        animationType="none"
        onRequestClose={() => !isDownloading && closeDownloadModal()}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: downloadModalOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => !isDownloading && closeDownloadModal()} />
          <Animated.View
            style={[styles.modalContent, { transform: [{ translateY: downloadModalTranslateY }] }]}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.modalTitle}>
              {isDownloading ? '음원 다운로드 중...' : '이제 비행기에서도 힐링비트를 즐길 수 있어요!'}
            </Text>

            {!isDownloading ? (
              <Text style={styles.modalSubtitle}>
                데이터 걱정 없이 언제 어디서나{"\n"}편안하게 감상해보세요.
              </Text>
            ) : (
              <View style={styles.progressWrapper}>
                <Text style={styles.sizeText}>전체 용량: {downloadTotalSize}</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${downloadProgress}%` }]} />
                </View>
                <Text style={styles.sizeText}>{downloadProgress}% 다운로드 중</Text>
              </View>
            )}

            <View style={styles.modalButtonContainer}>
              {!isDownloading ? (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.downloadButtonModal]}
                    onPress={() => downloadTrack(activeTrack)}
                  >
                    <Text style={styles.buttonText}>다운로드</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={closeDownloadModal}
                  >
                    <Text style={styles.buttonText}>취소</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      <Modal
        visible={isQueueVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsQueueVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsQueueVisible(false)}>
          <Pressable
            style={[styles.modalContent, { height: '70%' }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.queueHeader}>
              <Text style={styles.modalTitle}>현재 재생목록</Text>
              <TouchableOpacity onPress={() => setIsQueueVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.queueList} showsVerticalScrollIndicator={false}>
              {queue.map((track, index) => {
                const isActive = activeTrack.id === track.id;
                return (
                  <TouchableOpacity
                    key={`${track.id}-${index}`}
                    style={[styles.queueItem, isActive && styles.activeQueueItem]}
                    onPress={async () => {
                      await TrackPlayer.skip(index);
                      await TrackPlayer.play();
                      setIsQueueVisible(false);
                    }}
                  >
                    <Image source={{ uri: track.artwork || 'https://via.placeholder.com/40' } as any} style={styles.queueArtwork} />
                    <View style={styles.queueInfo}>
                      <Text style={[styles.queueTitle, isActive && styles.activeQueueTitle]} numberOfLines={1}>
                        {track.title}
                      </Text>
                      <Text style={styles.queueArtist}>{track.artist}</Text>
                    </View>
                    {isActive && <Ionicons name="stats-chart" size={16} color="#4A90E2" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
