import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { UnifiedSwitch, UnifiedTimePicker } from '@/shared/ui';
import { useSleepSettings } from '../model/useSleepSettings';

export const SleepSettings = ({ navigation }: any) => {
  const {
    isEnabled,
    wakeTime,
    routineDuration,
    showTimePicker,
    setShowTimePicker,
    showDurationPicker,
    setShowDurationPicker,
    toggleSwitch,
    onTimeChange,
    onDurationChange,
    startSleepMode,
    closePickers,
    formatDuration,
  } = useSleepSettings({ navigation });

  return (
    <TouchableWithoutFeedback onPress={closePickers}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Text style={styles.header}>수면 루틴</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.label}>알람 켜기</Text>
            <UnifiedSwitch value={isEnabled} onValueChange={toggleSwitch} />
          </View>

          {/* 기상 시간 설정 섹션 */}
          <View style={styles.settingItem}>
            <Text style={styles.label}>기상 시간</Text>
            <TouchableOpacity onPress={() => { setShowDurationPicker(false); setShowTimePicker(!showTimePicker); }}>
              <Text style={styles.value}>{`${wakeTime.hour}:${wakeTime.minute < 10 ? '0' + wakeTime.minute : wakeTime.minute}`}</Text>
            </TouchableOpacity>
          </View>

          {showTimePicker && (
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <UnifiedTimePicker
                value={new Date(new Date().setHours(wakeTime.hour, wakeTime.minute))}
                onChange={onTimeChange}
              />
            </View>
          )}

          {/* 루틴 지속 시간 설정 섹션 */}
          <View style={styles.settingItem}>
            <Text style={styles.label}>루틴 지속 시간</Text>
            <TouchableOpacity onPress={() => { setShowTimePicker(false); setShowDurationPicker(!showDurationPicker); }}>
              <Text style={styles.value}>{formatDuration(routineDuration.hour, routineDuration.minute)}</Text>
            </TouchableOpacity>
          </View>

          {showDurationPicker && (
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <UnifiedTimePicker
                value={new Date(new Date().setHours(routineDuration.hour, routineDuration.minute))}
                onChange={onDurationChange}
              />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={startSleepMode}>
          <Text style={styles.buttonText}>수면 모드 시작하기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 30,
    backgroundColor: '#fff',
    padding: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    marginTop: 40,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 18,
  },
  value: {
    fontSize: 18,
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
