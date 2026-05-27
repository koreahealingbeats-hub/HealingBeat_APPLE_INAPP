import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const mockData = {
  labels: ['월', '화', '수', '목', '금', '토', '일'],
  datasets: [
    {
      data: [6.5, 7.0, 5.5, 8.0, 7.5, 9.0, 8.5],
    },
  ],
};

export const SleepReportChart = ({ data }: { data: any[] }) => {
  const chartData = data.length > 0 ? {
    labels: data.map(d => d.day),
    datasets: [{ data: data.map(d => d.hours) }]
  } : mockData;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>주간 수면 분석</Text>
      <BarChart
        data={chartData}
        width={width - 60}
        height={220}
        yAxisLabel=""
        yAxisSuffix="h"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
});
