import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useHeartRatePoller } from '@/entities/health/model/useHeartRatePoller';
// import LottieView from 'lottie-react-native'; // TODO: Install lottie-react-native

export const HeartRateMonitor = () => {
  const { isPolling, data, error, refetch } = useHeartRatePoller();

  useEffect(() => {
    // Auto-start on mount
    refetch();
  }, [refetch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>스마트 심박수 모니터</Text>

      <View style={styles.contentContainer}>
        {isPolling ? (
          <View style={styles.statusContainer}>
            {/* <LottieView 
                source={require('../../assets/animations/heartbeat.json')} 
                autoPlay 
                loop 
                style={{ width: 100, height: 100 }} 
            /> */}
            <ActivityIndicator size="large" color="#FF4B4B" />
            <Text style={styles.statusText}>워치 데이터를 기다리는 중...</Text>
            <Text style={styles.subText}>웨어러블 기기를 확인해주세요</Text>
          </View>
        ) : error ? (
          <View style={styles.statusContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>재시도</Text>
            </TouchableOpacity>
          </View>
        ) : data && data.value > 0 ? (
          <View style={styles.resultContainer}>
            <Text style={styles.bpmValue}>{data.value}</Text>
            <Text style={styles.bpmLabel}>BPM</Text>
            <Text style={styles.dateText}>
              {new Date(data.date!).toLocaleTimeString()}
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
              <Text style={styles.refreshButtonText}>새로고침</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>측정 준비됨</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>시작</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  contentContainer: {
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  subText: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    color: '#FF4B4B',
    textAlign: 'center',
    marginBottom: 12,
  },
  resultContainer: {
    alignItems: 'center',
  },
  bpmValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF4B4B',
  },
  bpmLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: -4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  refreshButton: {
    marginTop: 8,
    padding: 8,
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
