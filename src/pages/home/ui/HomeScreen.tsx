import React, { useRef, useMemo, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Track } from 'react-native-track-player';
import { CustomTrack } from '@/entities/playlist/model/usePlaylistStore';

import { Header } from '@/shared/ui';
import { HeartRateCard } from './HeartRateCard';
import { MeasurementCardList } from './MeasurementCardList';
import { ImageSlider } from './ImageSlider';
import { ThemeList } from './ThemeList';
import { useHomeScreen } from '../model/useHomeScreen';
import { styles } from './HomeScreen.styles';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';


const DUMMY_SLIDES = [
  {
    id: 1,
    albumImageUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/albums/card_album04.png",
    link: "https://pub-3301ef846e1f43ba80f2a64bc146ba97.r2.dev/B2B/popup/ver1",
    videoUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/video/V_COLORING_04.mp4",
    minBpm: 50,
    maxBpm: 80,
    createdAt: "2025-08-25T06:36:46.058Z",
    producer: "HealingBeats",
    title: "깊은 수면",
    symbol: {
      imageUrl: null,
      type: "Sleep"
    },
    category: "내 호흡과 닮은 맞춤형 리듬으로\n편안한 잠의 흐름 만들어보세요.",
    subCategory: "잠이 쉽게 오지 않을때",
    subComment: "당신의 Heart Rate에 맞춰, 몸과 마음을\n 천천히 이완시켜 깊은 잠으로\n 이끌어주는 힐링비트입니다."
  },
  {
    id: 2,
    albumImageUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/albums/card_album01.png",
    link: "https://pub-3301ef846e1f43ba80f2a64bc146ba97.r2.dev/B2B/popup/bench_heartbeat_13Hz_10min",
    videoUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/video/V_COLORING_04.mp4",
    minBpm: 50,
    maxBpm: 100,
    createdAt: "2025-08-25T06:36:46.058Z",
    producer: "HealingBeats",
    title: "몰입준비",
    symbol: {
      imageUrl: null,
      type: null
    },
    category: "이 음악이 끝날 때쯤\n집중력은 더 단단해질 거에요",
    subCategory: "공부 시작 전",
    subComment: "당신의 Heart Rate에 맞춰,\n 집중하기 가장 좋은 컨디션을\n 만들어주는 힐링비트입니다."
  },
  {
    id: 3,
    albumImageUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/albums/card_album02.png",
    link: "https://pub-3301ef846e1f43ba80f2a64bc146ba97.r2.dev/B2B/popup/a%20mountain_heartbeat_13Hz_10min",
    videoUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/video/V_COLORING_04.mp4",
    minBpm: 50,
    maxBpm: 100,
    createdAt: "2025-08-25T06:36:46.058Z",
    producer: "HealingBeats",
    title: "집중 회복",
    symbol: {
      imageUrl: null,
      type: null,
    },
    category: "심장에 맞춘 사운드로\n한 문제 더 풀 힘을 얻으세요",
    subCategory: "집중 흐트러질 때",
    subComment: "당신의 Heart Rate에 맞춰,\n흐트러진 집중력을 다시\n정렬해주는 힐링비트입니다."
  },
  {
    id: 4,
    albumImageUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/albums/card_album03.png",
    link: "https://pub-56d3a661857748b68810da1a93a5b0be.r2.dev/themarkworld/memory%20of%20Water_heartbeat_13Hz_10min",
    videoUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/video/V_COLORING_04.mp4",
    minBpm: 50,
    maxBpm: 100,
    createdAt: "2025-08-25T06:36:46.058Z",
    producer: "HealingBeats",
    title: "짧은 휴식",
    symbol: {
      imageUrl: null,
      type: null
    },
    category: "내 몸이 들려주는\n리듬 속 평온 찾기",
    subCategory: "깊은 회복",
    subComment: "당신의 Heart Rate에 맞춰,\n지친 몸과 마음을 안정시키는\n힐링비트입니다."
  },
  {
    id: 5,
    albumImageUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/albums/card_album06.png",
    link: "https://pub-6061fd948d7f4417b03526994342c310.r2.dev/start/heartbeat_13Hz_10min",
    videoUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/video/V_COLORING_04.mp4",
    minBpm: 50,
    maxBpm: 80,
    createdAt: "2025-08-25T06:36:46.058Z",
    producer: "HealingBeats",
    title: "깊은 수면 자장가",
    symbol: {
      imageUrl: "https://s3.ap-northeast-2.amazonaws.com/healingbeats-pwa.com/albums/symbol_welcomeSpring.png",
      type: "SPECIAL"
    },
    category: "봄의 리듬으로 컨디션을 회복하세요",
    subCategory: "새로운 계절의 시작",
    subComment: "당신의 Heart Rate에 맞춰, 겨우내 웅크렸던\n몸과 마음에 따뜻한 봄의 생기를\n불어넣어 주는 힐링비트입니다."
  }
];

export const HomeScreen = () => {
  // 1. 바텀 시트를 제어하기 위한 ref 생성
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  // 2. 바텀 시트가 올라올 높이 지정 (여기서는 화면의 40% 높이까지 올라옵니다)
  const snapPoints = useMemo(() => ['50%'], []);

  // 3. 버튼을 눌렀을 때 모달을 위로 올리는 함수
  const handleOpenPress = () => {
    bottomSheetRef.current?.present(); // BottomSheetModal은 present()로 엽니다.
  };

  // 4. (선택사항) 바텀 시트의 상태 변화를 감지하는 콜백
  const handleSheetChanges = useCallback((index: number) => {
    console.log('바텀 시트 상태 변경, 현재 인덱스:', index);
    // index가 -1이면 완전히 닫힌 상태, 0이면 snapPoints의 첫 번째('40%')에 걸린 상태
  }, []);

  // 5. 배경(Backdrop) 렌더링 함수 추가
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  const {
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
  } = useHomeScreen();

  const renderOfflineTrackItem = (track: CustomTrack, playlist: CustomTrack[]) => (
    <TouchableOpacity
      key={track.id}
      style={styles.trackItem}
      onPress={() => handlePlayQueue(track, playlist)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: track.artwork }} style={styles.trackArtwork} />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{track.title}</Text>
        <Text style={styles.trackArtist}>{track.artist}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {!isTrackDownloaded(track.id) && (
          <TouchableOpacity
            onPress={() => downloadTrack(track)}
            disabled={isDownloading}
            style={{ marginRight: 10 }}
          >
            <Ionicons name="download-outline" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <Ionicons name="play-circle" size={32} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1D2F4E', '#14131E', '#13131E', '#05202F']}
      locations={[0, 0.4567, 0.9058, 1]}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.wrapper} edges={['top']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          onScroll={(e) => isFocused && handleScroll(e)}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }>
          <Header />
          {/* [심박수 카드] */}
          <HeartRateCard
            heartRate={heartRate}
            lastUpdated={lastUpdated}
            onPress={handleNavigateToHeartRate}
          />
          <TouchableOpacity style={styles.openButton} onPress={handleOpenPress}>
            <Text style={styles.buttonText}>
              힐링비트는 어디에 좋아요?
            </Text>
            <MaterialIcons name='keyboard-arrow-right' size={15} color={'#fff'} />
          </TouchableOpacity>
          {/* [심박수 측정] */}
          {/* <MeasurementCardList onSelectMethod={handleSelectMeasurementMethod} /> */}

          {isOffline ? (
            <View style={{ marginBottom: 20 }}>
              <View style={styles.offlineContainer}>
                <Ionicons name="cloud-offline-outline" size={48} color="#FF6B6B" />
                <Text style={styles.offlineTitle}>오프라인 상태입니다</Text>
                <Text style={styles.offlineSubtitle}>다운로드한 음원 리스트를 재생하세요.</Text>
              </View>
              <Text style={styles.listTitle}>다운로드된 음원 ({downloadedTracks.length})</Text>
              {downloadedTracks.length > 0 ? (
                downloadedTracks.map(t => renderOfflineTrackItem(t, downloadedTracks))
              ) : (
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.4)' }}>다운로드된 음원이 없습니다.</Text>
                </View>
              )}
            </View>
          ) : (
            <>
              {/* [음원 슬라이드] */}
              <ImageSlider data={DUMMY_SLIDES} />
              {/* 카테고리 별 음원 리스트  */}
              {/* <ThemeList /> */}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backdropComponent={(renderBackdrop)}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleBar}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View>
            <Image source={require('@assets/common/logo_color.png')}
              style={{ width: 43, height: 30, marginBottom: 22 }} />
            <Text style={styles.title}>
              어느 순간이든 당신의 리듬을 읽어,{'\n'}
              가장 적합한 사운드를 생성해 드립니다.
            </Text>
            <Text style={styles.description}>
              모드를 선택한 뒤, 배경처럼 잔잔히 흘려보세요.{'\n'}
              단 10분만 들어도 몸과 마음이 자연스럽게 안정됩니다.{'\n'}
              의식하지 않아도, 사운드가 당신을 이완시킵니다.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => bottomSheetRef.current?.dismiss()}
            style={styles.closeButton}
          >
            <Text >닫기</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </LinearGradient>
  );
};

