import React, { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, Animated } from 'react-native';

interface UnifiedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
  style?: any;
}

const WIDTH = 51;
const HEIGHT = 31;
const THUMB_SIZE = 27;
const PADDING = 2;

export const UnifiedSwitch = ({
  value,
  onValueChange,
  activeColor = '#34C759', // iOS 녹색
  inactiveColor = '#E9E9EA', // iOS 회색
  thumbColor = '#FFFFFF',
  style,
}: UnifiedSwitchProps) => {
  const offset = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(offset, {
      toValue: value ? 1 : 0,
      mass: 0.8,
      damping: 15,
      stiffness: 150,
      useNativeDriver: false, // backgroundColor interpolation은 native driver 미지원 (일부 환경)
    }).start();
  }, [value]);

  const backgroundColor = offset.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const translateX = offset.interpolate({
    inputRange: [0, 1],
    outputRange: [0, WIDTH - THUMB_SIZE - PADDING * 2],
  });

  const animatedContainerStyle = {
    backgroundColor,
  };

  const animatedThumbStyle = {
    transform: [{ translateX }],
  };

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [style, { opacity: pressed ? 0.9 : 1 }]}
    >
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <Animated.View style={[styles.thumb, { backgroundColor: thumbColor }, animatedThumbStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    padding: PADDING,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#FFFFFF', // 그림자 최적화를 위해 기본 배경색 추가
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  },
});
