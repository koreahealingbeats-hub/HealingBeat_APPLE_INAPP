import React, { useEffect } from 'react';
import { AppNavigator } from './src/app/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStore } from '@/entities/network/model/useNetworkStore';
import { toastConfig } from '@/shared/ui';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function App() {
  const { setNetworkStatus } = useNetworkStore();

  useEffect(() => {
    // 네트워크 상태 변경 리스너 등록
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkStatus(
        state.isConnected ?? true, 
        state.isInternetReachable ?? true
      );
    });

    return () => {
      unsubscribe();
    };
  }, [setNetworkStatus]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <AppNavigator />
          <Toast config={toastConfig} topOffset={60} />
        </SafeAreaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
