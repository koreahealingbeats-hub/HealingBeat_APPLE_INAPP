import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './HeartRateCard.styles';

interface HeartRateCardProps {
  heartRate: number;
  lastUpdated: string | null;
  onPress: () => void;
}

export const HeartRateCard = ({ heartRate, lastUpdated, onPress }: HeartRateCardProps) => {
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '데이터 없음';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
  };

  return (
    <>
      {/* 심박수 측정 전 */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text></Text>
            <Text style={styles.cardTitle}>당신의 Heart Rate</Text>
            <Text style={styles.refreshText}>➜ 측정하기</Text>
          </View>
          <Text style={styles.heartRate}>{heartRate > 0 ? `${heartRate} BPM` : '--'}</Text>
          <Text style={styles.subtext}>최근 측정: {formatTime(lastUpdated)}</Text>
          {/* <Text style={styles.subtext}>웨어러블 기기를 사용하여 측정합니다.</Text> */}
        </View>
      </TouchableOpacity>

      {/* 심박수 측정 후 */}
      <TouchableOpacity>

      </TouchableOpacity>
    </>
  );
};
