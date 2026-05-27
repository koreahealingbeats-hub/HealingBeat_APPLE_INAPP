import { create } from 'zustand';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  setNetworkStatus: (isConnected: boolean, isInternetReachable: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true, // 초기값은 가급적 true로 설정 (초기 로딩 시 오프라인 UI 번쩍임 방지)
  isInternetReachable: true,
  setNetworkStatus: (isConnected, isInternetReachable) => set({ 
    isConnected, 
    isInternetReachable 
  }),
}));
