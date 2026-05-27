import { useRef, useEffect } from 'react';
import { Dimensions, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTabScroll } from '@/shared/lib/context/TabScrollContext';
import { TAB_DATA } from '@/app/navigation/tabData';

export const useCustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { isExpanded, setIsExpanded, resetScroll } = useTabScroll();
  const { width: screenWidth } = Dimensions.get('window');

  useEffect(() => {
    resetScroll();
  }, [state.index]);

  const expandedWidth = Math.min(screenWidth * 0.8, 350); 
  const collapsedWidth = Math.min(200, expandedWidth * 0.85);

  const currentWidth = isExpanded ? expandedWidth : collapsedWidth;
  const TAB_COUNT = state.routes.length;
  const tabWidth = (currentWidth - 20) / TAB_COUNT;
  
  const currentRouteName = state.routes[state.index]?.name;
  const isTabScreen = TAB_DATA.some(tab => tab.name === currentRouteName);
  
  const TAB_HEIGHT = 64;
  const indicatorWidth = tabWidth * 1;
  const indicatorHeight = TAB_HEIGHT * 0.8;
  const indicatorOffset = (tabWidth - indicatorWidth) / 2 + (state.index * tabWidth) + 10;

  const widthAnim = useRef(new Animated.Value(currentWidth)).current;
  const indicatorOffsetAnim = useRef(new Animated.Value(indicatorOffset)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: isExpanded ? expandedWidth : collapsedWidth,
      damping: 27,
      stiffness: 150,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  useEffect(() => {
    Animated.spring(indicatorOffsetAnim, {
      toValue: indicatorOffset,
      damping: 18,
      stiffness: 150,
      mass: 0.8,
      useNativeDriver: false,
    }).start();
  }, [indicatorOffset]);

  const handleTabPress = (route: any, isFocused: boolean) => {
    resetScroll();
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  return {
    isExpanded,
    isTabScreen,
    widthAnim,
    indicatorOffsetAnim,
    indicatorWidth,
    indicatorHeight,
    handleTabPress,
    TAB_DATA,
  };
};
