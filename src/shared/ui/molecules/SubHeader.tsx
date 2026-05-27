import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';

export const SubHeader = ({ style = {} }: { style?: object | null }) => {
  const navigation = useNavigation<any>();

  return (
    <View style={[styles.header, {...style}]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
        <Image 
          source={require("@assets/header/icon_backArrow.png")} 
          style={{ width: 44, height: 44, marginLeft: -20 }} 
          contentFit="cover" 
        />  
      </TouchableOpacity>
      <Image 
        source={require("@assets/header/icon_subLogo.png")} 
        style={{ width: 35, height: 24, aspectRatio: 2 / 1 }} 
        contentFit="cover" 
      />  
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerIcon: {
    padding: 8,
  },
});
