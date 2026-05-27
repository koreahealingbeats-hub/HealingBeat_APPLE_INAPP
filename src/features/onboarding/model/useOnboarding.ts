import { useState } from 'react';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const slides = [
  {
    id: '1',
    title: '힐링비트에 오신 것을 환영합니다',
    description: '당신만의 스트레스 해소 솔루션.',
    image: 'https://via.placeholder.com/300',
  },
  {
    id: '2',
    title: '음악 테라피',
    description: '엄선된 플레이리스트와 백그라운드 재생으로 휴식을 취하세요.',
    image: 'https://via.placeholder.com/300',
  },
  {
    id: '3',
    title: '더 나은 수면',
    description: '수면을 기록하고 건강한 루틴을 설정하세요.',
    image: 'https://via.placeholder.com/300',
  },
];

export const useOnboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return {
    currentIndex,
    slides,
    width,
    handleScroll,
  };
};
