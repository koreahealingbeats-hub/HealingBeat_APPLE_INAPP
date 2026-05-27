import React, { createContext, useContext, useState, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface TabScrollContextType {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  resetScroll: () => void;
}

export const TabScrollContext = createContext<TabScrollContextType>({} as any);

export const TabScrollProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const lastOffset = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    // 최대 스크롤 가능 높이
    const maxScrollOffset = contentHeight - layoutHeight;

    // iOS의 맨 위 바운스 효과에서 애니메이션 방지
    if (offsetY <= 0) {
      if (!isExpanded) setIsExpanded(true);
      lastOffset.current = 0;
      return;
    }

    // iOS의 맨 아래 바운스 효과(오버스크롤)에서 탭바가 커지는 현상 방지
    // 최대 스크롤을 넘어서 바운스되는 중이면(offsetY > maxScrollOffset) 상태 변경 무시
    // 단, 스크롤 가능한 영역이 충분히 있는 경우에만 작동 (짧은 페이지에서 축소 방지)
    if (maxScrollOffset > 20 && offsetY >= maxScrollOffset) {
      if (isExpanded) setIsExpanded(false); // 맨 아래 도달 시 축소 상태 고정
      lastOffset.current = offsetY;
      return;
    }

    const dif = offsetY - lastOffset.current;
    
    // 스크롤을 내릴 때 (화면을 위로 밀 때) -> 축소
    if (dif > 10 && isExpanded) {
      setIsExpanded(false);
    } 
    // 스크롤을 올릴 때 (화면을 아래로 당길 때) -> 확대
    else if (dif < -10 && !isExpanded) {
      setIsExpanded(true);
    }
    
    lastOffset.current = offsetY;
  };
  
  const resetScroll = () => {
    setIsExpanded(true);
    lastOffset.current = 0;
  };

  return (
    <TabScrollContext.Provider value={{ isExpanded, setIsExpanded, handleScroll, resetScroll }}>
      {children}
    </TabScrollContext.Provider>
  );
};

export const useTabScroll = () => useContext(TabScrollContext);