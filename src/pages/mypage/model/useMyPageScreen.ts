import { useIsFocused } from '@react-navigation/native';
import { useTabScroll } from '@/shared/lib/context/TabScrollContext';
import { useBottomPadding } from '@/shared/lib/hooks/useBottomPadding';
import { usePlaylistStore } from '@/entities/playlist/model/usePlaylistStore';
import Toast from 'react-native-toast-message';

export const useMyPageScreen = () => {
  const isFocused = useIsFocused();
  const { handleScroll } = useTabScroll();
  const { bottomPadding } = useBottomPadding();
  const { isOfflineSimulated, toggleOfflineSimulation } = usePlaylistStore();

  const showToast = (type: 'success' | 'error' | 'info') => {
    Toast.show({
      type,
      text1: type === 'success' ? '성공!' : type === 'error' ? '오류 발생' : '알림',
      text2: `이것은 ${type} 토스트 메시지 테스트입니다.`,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  return {
    isFocused,
    handleScroll,
    bottomPadding,
    isOfflineSimulated,
    toggleOfflineSimulation,
    showToast,
  };
};
