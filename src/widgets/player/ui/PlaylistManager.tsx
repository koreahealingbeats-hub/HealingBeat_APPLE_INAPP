import React from 'react';
import { View, Text, Animated, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/shared/ui';
import { MaterialIcons } from '@expo/vector-icons';
import { usePlaylistManager } from '../model/usePlaylistManager';

export const PlaylistManager = () => {
  const insets = useSafeAreaInsets();
  const {
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
  } = usePlaylistManager();

  return (
    <View style={{ flex: 1, backgroundColor: '#14151A' }}>
      {/* 1. 배경 영역: 뒤에 절대 좌표로 배치 */}
      <View style={{ height: HEADER_HEIGHT + 30 + insets.top, width: '100%', position: 'absolute', top: 0, left: 0, right: 0 }}>
        {playlist.length > 0 && (
          <>
            <Image
              source={{ uri: playlist[0].artwork || 'https://via.placeholder.com/310' }}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
            />
            <SafeAreaView style={{
              flex: 1,
              paddingHorizontal: 20,
              justifyContent: 'space-between',
            }}>
              <Header />
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View>
                  <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>
                    {playlist[0].title}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>{playlist[0].producer}</Text>
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 }}
                  onPress={() => console.log('전체 재생 클릭')}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>전체 재생</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </>
        )}
      </View>
      {/* 2. 슬라이딩 시트 영역 */}
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            top: insets.top,
            transform: [{ translateY: sheetY }],
          }
        ]}
        {...panResponder.panHandlers}
      >
        {/* 드래그 핸들 바 */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          scrollEnabled={isExpanded}
          onScroll={handleScrollViewScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingBottom: bottomPadding + 60,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
          style={{ flex: 1, backgroundColor: '#1E1E23' }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('HeartRateScreen')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
              집중 사운드
            </Text>
            <MaterialIcons name='keyboard-arrow-right' size={24} color="#fff" />
          </TouchableOpacity>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20, alignItems: 'center', marginBottom: 40 }}>
            {playlist.map((item, index) => (
              <TouchableOpacity
                key={`${item.id}-${index}`}
                style={styles.item}
                onPress={() => playTrack(index)}
              >
                <Image
                  source={{ uri: item.artwork || 'https://via.placeholder.com/50' }}
                  style={styles.artwork}
                />
                <View style={styles.info}>
                  <Text style={[styles.title, { color: '#fff' }]}>{item.title}</Text>
                  <Text style={styles.artist}>{item.artist}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {playlist.length === 0 && (
              <Text style={styles.emptyText}>재생목록이 비어있습니다</Text>
            )}
          </ScrollView>
          <TouchableOpacity
            onPress={() => navigation.navigate('HeartRateScreen')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
              수면 사운드
            </Text>
            <MaterialIcons name='keyboard-arrow-right' size={24} color="#fff" />
          </TouchableOpacity>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20, alignItems: 'center', marginBottom: 40 }}>
            {playlist.map((item, index) => (
              <TouchableOpacity
                key={`${item.id}-${index}`}
                style={styles.item}
                onPress={() => playTrack(index)}
              >
                <Image
                  source={{ uri: item.artwork || 'https://via.placeholder.com/50' }}
                  style={styles.artwork}
                />
                <View style={styles.info}>
                  <Text style={[styles.title, { color: '#fff' }]}>{item.title}</Text>
                  <Text style={styles.artist}>{item.artist}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {playlist.length === 0 && (
              <Text style={styles.emptyText}>재생목록이 비어있습니다</Text>
            )}
          </ScrollView>
          <TouchableOpacity
            onPress={() => navigation.navigate('HeartRateScreen')}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
              스트레스 관리 사운드
            </Text>
            <MaterialIcons name='keyboard-arrow-right' size={24} color="#fff" />
          </TouchableOpacity>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20, alignItems: 'center', }}>
            {playlist.map((item, index) => (
              <TouchableOpacity
                key={`${item.id}-${index}`}
                style={styles.item}
                onPress={() => playTrack(index)}
              >
                <Image
                  source={{ uri: item.artwork || 'https://via.placeholder.com/50' }}
                  style={styles.artwork}
                />
                <View style={styles.info}>
                  <Text style={[styles.title, { color: '#fff' }]}>{item.title}</Text>
                  <Text style={styles.artist}>{item.artist}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {playlist.length === 0 && (
              <Text style={styles.emptyText}>재생목록이 비어있습니다</Text>
            )}
          </ScrollView>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
    width: '100%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E23',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  item: {
    marginBottom: 15,
  },
  artwork: {
    width: 136,
    height: 136,
    aspectRatio: 1 / 1,
    borderRadius: 14,
  },
  info: {
    marginTop: 8,
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  artist: {
    color: '#bbb',
    fontSize: 14,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});
