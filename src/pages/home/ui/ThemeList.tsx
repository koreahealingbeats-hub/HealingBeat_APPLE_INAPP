import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { styles } from './ThemeList.styles';
import { Ionicons } from '@expo/vector-icons';

export const ThemeList = () => {
  return (
    <View>
      <Text style={styles.themeTitle}>불면증에 잠 못 이루는 {"\n"}당신을 위한 맞춤형 리듬  </Text>
      <ScrollView
        horizontal={true} 
        showsHorizontalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={[styles.content, {gap:20}]}
      >
        <TouchableOpacity activeOpacity={0.7}>
          <ImageBackground source={require('@assets/bg_15min.png')} style={styles.themeItem} >
            <View style={styles.themeItemInner}>
              <Text style={styles.themeItemTitle}>15분 {"\n"}빠른 수면</Text>
              <View style={styles.themeItemInnerBottom}>
                <Text style={styles.themeItemTime}>-15:00</Text>
                <Ionicons name="play" size={24} color="rgb(235,235,235)" />
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7}>
          <ImageBackground source={require('@assets/bg_30min.png')} style={styles.themeItem} >
            <View style={styles.themeItemInner}>
              <Text style={styles.themeItemTitle}>30분 {"\n"}깊은 수면</Text>
              <View style={styles.themeItemInnerBottom}>
                <Text style={styles.themeItemTime}>-30:00</Text>
                <Ionicons name="play" size={24} color="rgb(235,235,235)" />
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7}>
          <ImageBackground source={require('@assets/bg_45min.png')} style={styles.themeItem} >
            <View style={styles.themeItemInner}>
              <Text style={styles.themeItemTitle}>45분 {"\n"}피로 회복</Text>
              <View style={styles.themeItemInnerBottom}>
                <Text style={styles.themeItemTime}>-45:00</Text>
                <Ionicons name="play" size={24} color="rgb(235,235,235)" />
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
