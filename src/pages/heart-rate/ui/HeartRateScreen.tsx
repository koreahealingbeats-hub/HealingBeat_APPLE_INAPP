import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeartRateScreen } from '../model/useHeartRateScreen';

export const HeartRateScreen = () => {
  const { heartRate, status, handleStartMeasurement } = useHeartRateScreen();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>원격 심박수 측정</Text>
      
      <View style={styles.content}>
        {status === 'measuring' ? (
          <View style={styles.measuringContainer}>
            <ActivityIndicator size="large" color="#e74c3c" />
            <Text style={styles.statusText}>워치에서 측정 중...</Text>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <Text style={styles.heartRateValue}>
              {heartRate ? `${heartRate} BPM` : '--'}
            </Text>
            <Text style={styles.statusText}>
              {heartRate ? '마지막 측정값' : '시작 버튼을 눌러 측정하세요'}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, status === 'measuring' && styles.buttonDisabled]} 
          onPress={handleStartMeasurement}
          disabled={status === 'measuring'}
        >
          <Text style={styles.buttonText}>
            {status === 'measuring' ? '측정 중...' : '측정 시작'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    marginTop: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  measuringContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartRateValue: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 40,
    width: '80%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
