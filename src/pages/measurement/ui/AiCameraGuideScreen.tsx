import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, SubHeader } from '@/shared/ui';
import { useAiCameraGuideScreen } from '../model/useAiCameraGuideScreen';

export const AiCameraGuideScreen = () => {
  const { startMeasurement } = useAiCameraGuideScreen();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#131725', '#0f101e', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <SubHeader />

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.textSection}>
            <Text style={styles.title}>AI 카메라 측정하기</Text>
            <Text style={styles.subtitle}>
              AI가 얼굴을 인식해 지금의 기분과 상태를 예측하고,{"\n"}
              당신에게 꼭 맞는 힐링사운드를 추천해드립니다.
            </Text>
          </View>

          <View style={styles.graphicSection}>
            <Image 
              source={require('@assets/AI_camera/icon_faceId.png')} 
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Footer Button */}
        <View style={styles.footer}>
          <Button 
            title="측정 하기" 
            onPress={startMeasurement} 
            style={{ width: '100%' }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  textSection: {
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  subtitle: {
    color: '#9CA5B2',
    fontSize: 16,
    lineHeight: 24,
  },
  graphicSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  footer: {
    paddingBottom: 30,
  },
});
