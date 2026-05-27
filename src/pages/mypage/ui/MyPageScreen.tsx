import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyPageScreen } from '../model/useMyPageScreen';

export const MyPageScreen = () => {
  const {
    isFocused,
    handleScroll,
    bottomPadding,
    isOfflineSimulated,
    toggleOfflineSimulation,
    showToast,
  } = useMyPageScreen();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        onScroll={(e) => isFocused && handleScroll(e)}
        scrollEventThrottle={16}
      >
        <Text style={styles.header}>마이페이지</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 정보</Text>
          <Text style={styles.text}>사용자 님</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설정</Text>
          <Text style={styles.text}>앱 버전 1.0.0</Text>
        </View>

        {/* 개발용 테스트 섹션 */}
        <View style={[styles.section, styles.devSection]}>
          <Text style={styles.devSectionTitle}>Developer Tools (Test Only)</Text>
          
          <View style={{ marginBottom: 20 }}>
            <Text style={[styles.text, { marginBottom: 12, fontWeight: '600' }]}>Toast Message Test</Text>
            <View style={styles.testButtonsRow}>
              <TouchableOpacity 
                style={[styles.testButton, { backgroundColor: '#10B981' }]} 
                onPress={() => showToast('success')}
              >
                <Text style={styles.testButtonText}>Success</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.testButton, { backgroundColor: '#EF4444' }]} 
                onPress={() => showToast('error')}
              >
                <Text style={styles.testButtonText}>Error</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.testButton, { backgroundColor: '#3B82F6' }]} 
                onPress={() => showToast('info')}
              >
                <Text style={styles.testButtonText}>Info</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.devRow}>
            <Text style={styles.text}>오프라인 시뮬레이션</Text>
            <Switch 
              value={isOfflineSimulated} 
              onValueChange={toggleOfflineSimulation}
              trackColor={{ false: "#767577", true: "#FF6B6B" }}
              thumbColor={isOfflineSimulated ? "#fff" : "#f4f3f4"}
            />
          </View>
          <Text style={styles.devHint}>* 기능을 켜면 즉시 오프라인 화면으로 이동합니다.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
  devSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  devSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  devRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  testButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  devHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  }
});
