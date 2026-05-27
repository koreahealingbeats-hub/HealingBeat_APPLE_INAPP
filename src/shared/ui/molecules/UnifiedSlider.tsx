import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, LayoutChangeEvent, TextInput, Animated, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

interface UnifiedSliderProps {
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  onSlidingComplete?: (value: number) => void;
  onValueChange?: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: any;
  duration?: number;
  showBubble?: boolean;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const UnifiedSlider = ({
  value,
  minimumValue = 0,
  maximumValue = 1,
  onSlidingComplete,
  onValueChange,
  minimumTrackTintColor = '#FFFFFF',
  maximumTrackTintColor = '#555555',
  thumbTintColor = '#FFFFFF',
  style,
  duration = 0,
  showBubble = false,
}: UnifiedSliderProps) => {
  const [width, setWidth] = useState(0);
  const isGestureActive = useRef(false);
  const [remainingTimeText, setRemainingTimeText] = useState('');

  const translationX = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(1)).current;

  // Update thumb position when value changes from outside
  useEffect(() => {
    if (!isGestureActive.current && width > 0) {
      const range = maximumValue - minimumValue;
      const progress = (Math.max(minimumValue, Math.min(value, maximumValue)) - minimumValue) / (range || 1);
      translationX.setValue(progress * width);
    }
  }, [value, width, minimumValue, maximumValue]);

  // Update remaining time bubble text
  useEffect(() => {
    const range = maximumValue - minimumValue;
    // value prop이 바뀔 때만 업데이트 (슬라이딩 중에는 내부 상태로 업데이트)
    if (!isGestureActive.current) {
      const remaining = Math.max(0, duration - value);
      setRemainingTimeText(`-${formatTime(remaining)}`);
    }
  }, [value, duration, minimumValue, maximumValue]);

  const updateInternalValue = (x: number) => {
    const range = maximumValue - minimumValue;
    const progress = Math.max(0, Math.min(x / width, 1));
    const newValue = minimumValue + progress * range;
    
    const remaining = Math.max(0, duration - newValue);
    setRemainingTimeText(`-${formatTime(remaining)}`);

    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const completeSliding = (x: number) => {
    const range = maximumValue - minimumValue;
    const progress = Math.max(0, Math.min(x / width, 1));
    const finalValue = minimumValue + progress * range;
    if (onSlidingComplete) {
      onSlidingComplete(finalValue);
    }
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      isGestureActive.current = true;
      Animated.timing(bubbleScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: false,
      }).start();
    })
    .onUpdate((event) => {
      let newX = event.x;
      if (newX < 0) newX = 0;
      if (newX > width) newX = width;
      translationX.setValue(newX);
      updateInternalValue(newX);
    })
    .onFinalize((event) => {
      let finalX = event.x;
      if (finalX < 0) finalX = 0;
      if (finalX > width) finalX = width;
      completeSliding(finalX);
      
      Animated.timing(bubbleScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        isGestureActive.current = false;
      });
    })
    .runOnJS(true);

  const tap = Gesture.Tap()
    .onBegin((event) => {
        isGestureActive.current = true;
        let newX = event.x;
        if(newX < 0) newX = 0;
        if(newX > width) newX = width;
        translationX.setValue(newX);
        updateInternalValue(newX);
    })
    .onFinalize((event) => {
       let finalX = event.x;
       if(finalX < 0) finalX = 0;
       if(finalX > width) finalX = width;
       completeSliding(finalX);
       isGestureActive.current = false;
    })
    .runOnJS(true);
    
  const composed = Gesture.Race(pan, tap);

  const thumbStyle = {
    transform: [{ translateX: Animated.subtract(translationX, 1) }], 
    backgroundColor: thumbTintColor,
  };

  const bubbleStyle = {
    transform: [
      { translateX: Animated.subtract(translationX, 25) },
      { scale: bubbleScale },
    ],
    opacity: showBubble ? 1 : 0,
  };

  const activeTrackStyle = {
    width: translationX,
    backgroundColor: minimumTrackTintColor,
  };

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      <GestureDetector gesture={composed}>
        <View style={styles.touchArea}>
          {/* Bubble (Time Indicator) */}
          <Animated.View style={[styles.bubble, bubbleStyle]}>
            <Text style={styles.bubbleText}>{remainingTimeText}</Text>
          </Animated.View>

          {/* 배경 트랙 */}
          <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]} />
          
          {/* 활성 트랙 (채워진 부분) */}
          <Animated.View style={[styles.track, styles.activeTrack, activeTrackStyle]} />
          
          {/* 썸 (조절 버튼) */}
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    justifyContent: 'center',
  },
  touchArea: {
    height: 44,
    justifyContent: 'center',
    width: '100%',
    overflow: 'visible',
  },
  track: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    width: '100%',
  },
  activeTrack: {
  },
  thumb: {
    position: 'absolute',
    width: 2,
    height: 18,
    borderRadius: 1,
    top: 13,
  },
  bubble: {
    position: 'absolute',
    top: -20,
    width: 50,
    alignItems: 'center',
  },
  bubbleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
    textAlign: 'center',
    width: 50,
  },
});
