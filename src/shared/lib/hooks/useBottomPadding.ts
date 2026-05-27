import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayer } from '@/features/play-audio/model/usePlayer';
import { useRoute } from '@react-navigation/native';
import { TAB_DATA } from '@/app/navigation/tabData';

export const useBottomPadding = (forceTabBarVisible?: boolean) => {
  const insets = useSafeAreaInsets();
  const { activeTrack } = usePlayer();
  const route = useRoute();

  // 탭 스크린 목록 (탭 바가 보이는 화면들)
  const tabScreens = TAB_DATA.map(tab => tab.name);
  
  // 파라미터로 명시되지 않으면 현재 화면이 탭 스크린인지 확인
  const isTabBarVisible = forceTabBarVisible !== undefined 
    ? forceTabBarVisible 
    : tabScreens.includes(route.name);
  const TAB_BAR_HEIGHT = 24;
  const TAB_BAR_BOTTOM_MARGIN = Math.max(insets.bottom, 20);
  const MINI_PLAYER_HEIGHT = 64;

  // AppNavigator.tsx에 정의된 미니 플레이어의 하단 띄움 위치와 동일한 로직
  const miniPlayerBottom = isTabBarVisible
    ? TAB_BAR_BOTTOM_MARGIN + TAB_BAR_HEIGHT + 10
    : insets.bottom + 20;

  // 미니 플레이어가 떠 있을 때는 미니 플레이어 위로 20 여백 추가
  if (activeTrack) {
    return {
      bottomPadding: isTabBarVisible 
        ? miniPlayerBottom + MINI_PLAYER_HEIGHT + 40 
        : 0,
    };
  }

  // 탭바만 떠 있을 때는 탭바 위로 20 여백 추가
  return {
    bottomPadding: isTabBarVisible 
      ? TAB_BAR_BOTTOM_MARGIN + TAB_BAR_HEIGHT + 40 
      : insets.bottom + 20,
  };
};
