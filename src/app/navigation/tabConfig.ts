import { HomeScreen } from '@/pages/home/ui/HomeScreen';
import { PlaylistManager } from '@/widgets/player/ui/PlaylistManager';
import { MyPageScreen } from '@/pages/mypage/ui/MyPageScreen';
import { TAB_DATA } from './tabData';

const getComponent = (name: string) => {
  switch (name) {
    case 'Home': return HomeScreen;
    case 'Sound': return PlaylistManager;
    case 'Therapy': return MyPageScreen;
    default: return HomeScreen;
  }
};

export const TAB_SCREENS = TAB_DATA.map(tab => ({
  ...tab,
  component: getComponent(tab.name),
}));
