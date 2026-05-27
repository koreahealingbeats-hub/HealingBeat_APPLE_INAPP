import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BaseToast, ErrorToast, ToastConfig as ToastConfigType } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * [토스트 메시지 설정]
 * 전역적으로 사용되는 토스트 메시지의 디자인을 정의합니다.
 */
export const toastConfig: ToastConfigType = {
  success: ({ text1, text2 }) => (
    <View style={styles.container}>
      <View style={[styles.content, styles.successBackground]}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#FFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text1}>{text1}</Text>
          {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
        </View>
      </View>
    </View>
  ),

  error: ({ text1, text2 }) => (
    <View style={styles.container}>
      <View style={[styles.content, styles.errorBackground]}>
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle" size={24} color="#FFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text1}>{text1}</Text>
          {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
        </View>
      </View>
    </View>
  ),

  info: ({ text1, text2 }) => (
    <View style={styles.container}>
      <View style={[styles.content, styles.infoBackground]}>
        <View style={styles.iconContainer}>
          <Ionicons name="information-circle" size={24} color="#FFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text1}>{text1}</Text>
          {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
        </View>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    borderRadius: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 20,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  text1: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  text2: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  successBackground: {
    backgroundColor: '#10B981',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  errorBackground: {
    backgroundColor: '#EF4444',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  infoBackground: {
    backgroundColor: '#3B82F6',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
});
