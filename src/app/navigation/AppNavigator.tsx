import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Animated, ActivityIndicator, Dimensions, Easing, PanResponder } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { SleepSettings } from '@/pages/sleep/ui/SleepSettings';
import { SleepMode } from '@/pages/sleep/ui/SleepMode';
import { OnboardingCarousel } from '@/features/onboarding/ui/OnboardingCarousel';
import { MiniPlayer } from '@/widgets/player/ui/MiniPlayer';
import { FullPlayer } from '@/widgets/player/ui/FullPlayer';
import { MyPageScreen } from '@/pages/mypage/ui/MyPageScreen';
import { TAB_SCREENS } from './tabConfig';
import { PermissionScreen } from '@/pages/permission/ui/PermissionScreen';
import { HeartRateScreen } from '@/pages/heart-rate/ui/HeartRateScreen';
import { AiCameraScreen } from '@/pages/measurement/ui/AiCameraScreen';
import { AiCameraGuideScreen } from '@/pages/measurement/ui/AiCameraGuideScreen';
import { AiCameraResultScreen } from '@/pages/measurement/ui/AiCameraResultScreen';

import { usePlayer } from '@/features/play-audio/model/usePlayer';
import { STORAGE_KEYS } from '@/shared/constants/storage';
import { TabScrollProvider } from '@/shared/lib/context/TabScrollContext';
import { CustomTabBar } from '@/widgets/custom-tab-bar/ui/CustomTabBar';
import { usePlaylistStore } from '@/entities/playlist/model/usePlaylistStore';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const screenHeight = Dimensions.get('window').height;

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      {TAB_SCREENS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>();
  const [initialNavigationState, setInitialNavigationState] = useState<any>(undefined);
  const [isInnerModalActive, setIsInnerModalActive] = useState(false);
  const isInnerModalActiveRef = useRef(false);

  useEffect(() => {
    isInnerModalActiveRef.current = isInnerModalActive;
  }, [isInnerModalActive]);

  const navigationRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const insets = useSafeAreaInsets();
  const { pausePlayer } = usePlayer();
  const { isOfflineSimulated } = usePlaylistStore();

  const IMMERSIVE_SCREENS = ['AiCameraGuideScreen', 'AiCameraScreen', 'AiCameraResultScreen'];

  const TAB_BAR_HEIGHT = 64;
  const TAB_BAR_BOTTOM_MARGIN = Math.max(insets.bottom, 20);

  const isImmersiveScreen = currentRouteName && IMMERSIVE_SCREENS.includes(currentRouteName);
  const isTabBarVisible = !currentRouteName || currentRouteName === 'MainTabs';

  const isMiniPlayerVisible = !isImmersiveScreen;

  const miniPlayerBottom = isMiniPlayerVisible
    ? (isTabBarVisible ? TAB_BAR_BOTTOM_MARGIN + TAB_BAR_HEIGHT + 8 : insets.bottom + 20)
    : -100;

  useEffect(() => {
    if (isImmersiveScreen) {
      console.log(`[Navigation] Entering immersive screen (${currentRouteName}), pausing audio...`);
      pausePlayer();
    }
  }, [currentRouteName, isImmersiveScreen, pausePlayer]);

  useEffect(() => {
    checkOnboarding();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isFullPlayerVisible ? 0 : screenHeight,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [isFullPlayerVisible]);

  const fullPlayerPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (isInnerModalActiveRef.current) return false;
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > screenHeight / 3) {
          setIsFullPlayerVisible(false);
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const checkOnboarding = async () => {
    try {
      const [onboardingValue, timerState, timerEndTime] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.TIMER_STATE),
        AsyncStorage.getItem(STORAGE_KEYS.TIMER_END_TIME),
      ]);

      const hasOnboarded = onboardingValue === 'true';

      if (timerState === 'RUNNING' && timerEndTime) {
        setInitialNavigationState({
          index: 1,
          routes: [
            { name: 'MainTabs' },
            { name: 'SleepMode' },
          ],
        });
      }

      setHasOnboarded(hasOnboarded);
    } catch (e) {
      setHasOnboarded(false);
    }
  };

  const handleOnboardingFinish = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, 'true');
      setHasOnboarded(true);
    } catch (e) {
      console.log('Error saving onboarding status', e);
    }
  };

  if (hasOnboarded === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <OnboardingCarousel onFinish={handleOnboardingFinish} />;
  }

  return (
    <TabScrollProvider>
      <NavigationContainer
        ref={navigationRef}
        initialState={initialNavigationState}
        onStateChange={(state) => {
          const route = state?.routes[state.index];
          Promise.resolve().then(() => {
            setCurrentRouteName(route?.name);
          });
        }}
      >
        <StatusBar style='light' />
        <View style={{ flex: 1 }}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="HeartRateScreen" component={HeartRateScreen} />
            <Stack.Screen name="PermissionScreen" component={PermissionScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="MyPageScreen" component={MyPageScreen} />
            <Stack.Screen name="AiCameraGuideScreen" component={AiCameraGuideScreen} />
            <Stack.Screen name="AiCameraScreen" component={AiCameraScreen} />
            <Stack.Screen name="AiCameraResultScreen" component={AiCameraResultScreen} />
            <Stack.Screen name="SleepMode" component={SleepMode} />
            <Stack.Screen name="SleepSettings" component={SleepSettings} />
          </Stack.Navigator>

          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              bottom: miniPlayerBottom,
              left: 0,
              right: 0,
              zIndex: 100,
            }}
          >
            <MiniPlayer onPress={() => setIsFullPlayerVisible(true)} />
          </View>

          <Animated.View
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              transform: [{ translateY: slideAnim }],
              zIndex: 100,
              backgroundColor: 'transparent'
            }}
            {...fullPlayerPanResponder.panHandlers}
          >
            <View style={{ flex: 1, backgroundColor: '#000' }}>
              <FullPlayer
                onClose={() => setIsFullPlayerVisible(false)}
                onModalStateChange={setIsInnerModalActive}
              />
            </View>
          </Animated.View>
        </View>
      </NavigationContainer>
    </TabScrollProvider>
  );
};
