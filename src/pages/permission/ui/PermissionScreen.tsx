import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { usePermissionScreen } from '../model/usePermissionScreen';

interface PermissionScreenProps {
  onFinish?: () => void;
  navigation?: any;
}

export const PermissionScreen = ({ onFinish, navigation }: PermissionScreenProps) => {
  const {
    healthPermission,
    notificationPermission,
    requestPermissions,
    openHealthSettings,
  } = usePermissionScreen({ onFinish, navigation });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>권한 설정이 필요합니다</Text>
      <Text style={styles.description}>
        앱을 원활하게 사용하기 위해 다음 권한을 허용해 주세요.
      </Text>

      <View style={styles.permissionItem}>
        <Text style={styles.permissionTitle}>🔔 알림</Text>
        <Text style={styles.permissionDesc}>알람을 받기 위해 필요합니다.</Text>
        <Text style={[styles.status, notificationPermission ? styles.granted : styles.denied]}>
          {notificationPermission ? '허용됨' : '권한 필요'}
        </Text>
      </View>

      <View style={styles.permissionItem}>
        <Text style={styles.permissionTitle}>❤️ 건강 데이터</Text>
        <Text style={styles.permissionDesc}>심박수 데이터를 분석하기 위해 필요합니다.</Text>
        <Text style={styles.permissionDesc}>* 안드로이드 설정 -&gt; 앱 권한에는 표시되지 않을 수 있습니다. Health Connect 설정에서 확인해주세요.</Text>
        <Text style={[styles.status, healthPermission ? styles.granted : styles.denied]}>
          {healthPermission ? '허용됨' : '권한 필요'}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={requestPermissions}>
        <Text style={styles.buttonText}>권한 허용하기 (팝업)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={openHealthSettings}>
        <Text style={styles.linkText}>Health Connect 설정 열기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openSettings()}>
        <Text style={styles.linkText}>앱 설정 열기 (알림)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  permissionItem: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  permissionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  granted: {
    color: '#4CAF50',
  },
  denied: {
    color: '#F44336',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
