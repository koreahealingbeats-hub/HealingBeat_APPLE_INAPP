import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStore } from '@/entities/network/model/useNetworkStore';

const { width } = Dimensions.get('window');

export const NetworkBanner = () => {
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetworkStore();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: !isConnected ? 0 : -100,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [isConnected]);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          top: insets.top + 10,
          transform: [{ translateY: slideAnim }] 
        }
      ]}
    >
      <View style={styles.banner}>
        <Ionicons name="cloud-offline" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.text}>인터넷 연결이 원활하지 않습니다.</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B', // 그림자 최적화를 위해 불투명 배경색 사용 (rgba(255, 107, 107, 0.9) 대신)
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
