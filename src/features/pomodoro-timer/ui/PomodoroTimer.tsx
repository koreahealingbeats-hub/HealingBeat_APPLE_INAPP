import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { usePomodoroTimer, UsePomodoroTimerProps } from '../model/usePomodoroTimer';

export const PomodoroTimer = ({ duration, timeLeft, isRunning, onDurationChange }: UsePomodoroTimerProps) => {
  const {
    RADIUS,
    CENTER,
    SIZE,
    visualAngle,
    displayValue,
    panResponder,
    polarToCartesian,
    describeArc,
    formatCenterTime,
  } = usePomodoroTimer({ duration, timeLeft, isRunning, onDurationChange });

  return (
    <View style={styles.container}>
      {/* Timer Circle */}
      <View 
        style={[styles.svgContainer, { width: SIZE, height: SIZE }]}
        {...panResponder.panHandlers}
      >
        <Svg height={SIZE} width={SIZE}>
          {/* Background Circle */}
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#2c2c2e" />
          
          {/* Red Pie Slice */}
          {visualAngle >= 360 ? (
            <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#FF4D4D" />
          ) : visualAngle > 0 && (
             <Path
                d={describeArc(CENTER, CENTER, RADIUS, 0, visualAngle)}
                fill="#FF4D4D"
             />
          )}
          
          {/* Tick Marks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const tickAngle = i * 30; // Every 5 minutes
            const start = polarToCartesian(CENTER, CENTER, RADIUS, tickAngle);
            const end = polarToCartesian(CENTER, CENTER, RADIUS - 10, tickAngle);
            return (
              <Line
                key={i}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
              />
            );
          })}
           
          {/* Start Line (0 degrees) */}
          <Line
            x1={CENTER}
            y1={CENTER}
            x2={CENTER}
            y2={CENTER - RADIUS}
            stroke="#fff"
            strokeWidth="2"
          />

          {/* 가장자리 선 (이동하는 엣지) */}
          {visualAngle > 0 && visualAngle < 360 && (
            <Line
              x1={CENTER}
              y1={CENTER}
              x2={polarToCartesian(CENTER, CENTER, RADIUS, visualAngle).x}
              y2={polarToCartesian(CENTER, CENTER, RADIUS, visualAngle).y}
              stroke="#fff"
              strokeWidth="2"
            />
          )}
        </Svg>
      </View>
      
      {/* Time Display */}
      <Text style={styles.timeText}>{formatCenterTime(displayValue)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 20,
    fontVariant: ['tabular-nums'],
  },
});
