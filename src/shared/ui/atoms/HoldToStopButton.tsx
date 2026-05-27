import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';

interface HoldToStopButtonProps {
  onStop: () => void;
  duration?: number; // ms 단위, 기본값 3000
}

export const HoldToStopButton = ({ onStop, duration = 3000 }: HoldToStopButtonProps) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [isHolding, setIsHolding] = useState(false);

  // 채워지는 배경 스타일링
  const animatedStyle = {
    width: progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
  };

  const handlePressIn = () => {
    setIsHolding(true);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: false, // width는 native driver 미지원
    }).start(({ finished }) => {
      if (finished) {
        onStop();
      }
    });
  };

  const handlePressOut = () => {
    setIsHolding(false);
    progressAnim.stopAnimation();
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.button}
      >
        <View style={styles.backgroundLayer} />
        <Animated.View style={[styles.fillLayer, animatedStyle]} />
        <Text style={styles.text}>{isHolding ? "계속 누르고 있으면 종료됩니다" : "눌러서 종료"}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    height: 60,
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333', // 비활성 배경색
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#333',
  },
  fillLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FF9500', // 활성 채우기 색상 (주황색)
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    zIndex: 1, // 텍스트가 채우기 레이어 위에 오도록 설정
  },
});
