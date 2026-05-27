import React from 'react';
import { Text, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { styles } from './MeasurementCardList.styles';

interface MeasurementCardListProps {
  onSelectMethod: (method: string) => void;
}

export const MeasurementCardList = ({ onSelectMethod }: MeasurementCardListProps) => {
  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <TouchableOpacity style={styles.card} onPress={() => onSelectMethod('AI Camera')} activeOpacity={0.7}>
        <Image
          source={require('@assets/home/icon_AI-camera.png')}
          style={styles.cardIcon}
          contentFit="none"
        />
        <Text
          style={styles.cardTitle}
          textBreakStrategy="simple"
          lineBreakStrategyIOS="hangul-word">
          AI카메라
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => onSelectMethod('Device')} activeOpacity={0.7}>
        <Image
          source={require('@assets/home/icon_watch.png')}
          style={styles.cardIcon}
          contentFit="none"
        />
        <Text style={styles.cardTitle}
          textBreakStrategy="simple"
          lineBreakStrategyIOS="hangul-word">디바이스</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
