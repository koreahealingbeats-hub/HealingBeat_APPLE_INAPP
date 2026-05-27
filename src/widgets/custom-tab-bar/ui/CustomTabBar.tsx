import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useCustomTabBar } from '../model/useCustomTabBar';

export const CustomTabBar = (props: BottomTabBarProps) => {
  const { state, descriptors } = props;
  const insets = useSafeAreaInsets();
  const {
    isExpanded,
    isTabScreen,
    widthAnim,
    indicatorOffsetAnim,
    indicatorWidth,
    indicatorHeight,
    handleTabPress,
    TAB_DATA,
  } = useCustomTabBar(props);

  if (!isTabScreen) {
    return null;
  }

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 20) }]} pointerEvents="box-none">
      <Animated.View style={[styles.container, { width: widthAnim }]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.innerContainer}>
            {/* 리퀴드 글라스 포인터 (움직이는 배경) */}
            <Animated.View
              style={[
                styles.indicator,
                {
                  transform: [{ translateX: indicatorOffsetAnim }],
                  width: indicatorWidth,
                  height: indicatorHeight,
                  borderRadius: indicatorHeight / 2,
                }
              ]}
            />

            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const tabConfig = TAB_DATA.find((t) => t.name === route.name);
              const iconSource = tabConfig ? tabConfig.icon : require('@assets/tab_bar/icon_home.png');

              return (
                <TouchableOpacity
                  key={index}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onPress={() => handleTabPress(route, isFocused)}
                  style={styles.tabItem}
                  activeOpacity={0.7}
                >
                  <Image
                    source={iconSource}
                    style={{ width: 22, height: 22 }}
                  />
                  {isExpanded && (
                    <Text style={[styles.tabLabel, { color: isFocused ? '#FFFFFF' : '#888888' }]}>
                      {route.name}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  container: {
    position: 'relative',
    height: 64,
    borderRadius: 32,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: '#1E1E23', // 그림자 최적화를 위해 배경색 추가
  },
  gradientBorder: {
    flex: 1,
    borderRadius: 32,
    padding: 1.5,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 30, 35, 0.75)',
    borderRadius: 31,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  }
});
