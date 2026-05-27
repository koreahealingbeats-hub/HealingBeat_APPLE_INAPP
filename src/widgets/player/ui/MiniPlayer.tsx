import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from './MiniPlayer.styles';
import { useMiniPlayer } from '../model/useMiniPlayer';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const MiniPlayer = ({ onPress }: { onPress: () => void }) => {
  const { activeTrack, isPlaying, togglePlayback, playerWidth } = useMiniPlayer();

  if (!activeTrack) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.container, { width: playerWidth }]}
        onPressOut={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.innerContainer}>
            <Image
              source={{ uri: activeTrack.artwork || 'https://via.placeholder.com/50' }}
              style={styles.artwork}
            />
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>{activeTrack.title}</Text>
              <Text style={styles.artist} numberOfLines={1}>{activeTrack.artist}</Text>
            </View>
            <TouchableOpacity onPress={togglePlayback} style={styles.button}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
