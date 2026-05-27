import { useState, useEffect } from 'react';
import { PanResponder } from 'react-native';

const RADIUS = 120;
const CENTER = RADIUS;
const SIZE = RADIUS * 2;

export interface UsePomodoroTimerProps {
  duration: number;
  timeLeft: number;
  isRunning: boolean;
  onDurationChange: (duration: number) => void;
}

export const usePomodoroTimer = ({ duration, timeLeft, isRunning, onDurationChange }: UsePomodoroTimerProps) => {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      let newAngle = (duration / 60) * 6;
      setAngle(newAngle);
    }
  }, [duration, isRunning]);

  const displayValue = isRunning ? timeLeft : duration;
  const displayAngle = isRunning ? (timeLeft / 60) * 6 : angle;
  const visualAngle = Math.min(360, Math.max(0, displayAngle));

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", x, y,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", x, y
    ].join(" ");
  };

  const handleGesture = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent; 
    const x = locationX - CENTER;
    const y = locationY - CENTER;
    
    let theta = Math.atan2(y, x) * 180 / Math.PI; 
    
    let adjusted = theta + 90;
    if (adjusted < 0) adjusted += 360;
    
    let minutes = Math.round(adjusted / 6);
    if (minutes === 0 && adjusted > 300) minutes = 60; 
    
    setAngle(minutes * 6);
    onDurationChange(minutes * 60); 
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isRunning,
    onMoveShouldSetPanResponder: () => !isRunning,
    onPanResponderGrant: (evt) => {
       handleGesture(evt);
    },
    onPanResponderMove: (evt) => {
       handleGesture(evt);
    },
  });

  const formatCenterTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (isRunning) {
         if (h > 0) return `${h}:${m<10?'0'+m:m}:${s<10?'0'+s:s}`;
         return `${m}:${s<10?'0'+s:s}`;
    } else {
         if (h > 0) return `${h}시간 ${m}분`;
         return `${m}분`;
    }
  };

  return {
    RADIUS,
    CENTER,
    SIZE,
    visualAngle,
    displayValue,
    panResponder,
    polarToCartesian,
    describeArc,
    formatCenterTime,
  };
};
