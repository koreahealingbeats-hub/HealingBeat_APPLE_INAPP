import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  style?: StyleProp<ViewStyle>;
}

export const Header = (props: HeaderProps) => {
  const navigation = useNavigation<any>();

  return (
    <View style={[styles.container, props.style]}>
      <Image
        source={require('@assets/header/logo.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <TouchableOpacity 
      onPress={() => navigation.navigate('MyPageScreen')}
      style={styles.myPageButton}
      >
        <Image
          source={require('@assets/header/icon_myPage.png')}
          style={styles.myPageIcon}
          contentFit="cover"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop:15,
    paddingBottom: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 107,
    height: 24,
  },
  myPageButton: {
    width: 40,
    height: 40,
    borderRadius: '100%',
    overflow: 'hidden',
  },
  myPageIcon: {
    width: 40,
    height: 40,
    aspectRatio: 1/1,
  },
});
