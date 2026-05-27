// import React from 'react';
// import { View, Text, useWindowDimensions } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import { interpolate } from 'react-native-reanimated';
// import { styles } from './ImageSlider.styles';
// import { Image } from 'expo-image';

// interface SlideItemType {
//   id: number;
//   image: string;
//   title: string;
//   comment: string;
// }

// interface ImageSliderProps {
//   data: SlideItemType[];
// }

// export const ImageSlider = ({ data }: ImageSliderProps) => {
//   const { width } = useWindowDimensions();

//   // 기존 반응형 너비/높이 계산식 유지
//   const ITEM_WIDTH = Math.min(width * 0.78, 330);
//   const SLIDER_HEIGHT = ITEM_WIDTH * 0.75 + 110;

//   // 데이터 예외 처리 (데이터가 들어오기 전 렌더링 방지)
//   if (!data || data.length === 0) return null;

//   return (
//     <View style={[styles.sliderContainer, { height: SLIDER_HEIGHT + 45, alignItems: 'center' }]}>
//       <Carousel
//         loop={false}
//         width={ITEM_WIDTH}
//         height={SLIDER_HEIGHT}
//         autoPlay={true}
//         autoPlayInterval={5000}
//         data={data}
//         scrollAnimationDuration={600}
//         style={{ overflow: 'visible', width: width, justifyContent: 'center' }}

//         // ⭐ 실시간 인터폴레이션 애니메이션 (미는 도중에 크기가 부드럽게 변함)
//         customAnimation={(value) => {
//           'worklet';
//           const scale = interpolate(value, [-1, 0, 1], [0.8, 1, 0.8]);
//           const opacity = interpolate(value, [-1, 0, 1], [0.7, 1, 0.7]);

//           return {
//             transform: [{ scale }],
//             opacity,
//           };
//         }}

//         renderItem={({ item }) => (
//           <View style={[styles.slideItem, { width: ITEM_WIDTH }]}>
//             <View style={styles.shadowWrapper}>
//               <View style={styles.slideInner}>
//                 <Image
//                   source={{ uri: item.image }}
//                   style={styles.slideImage}
//                   contentFit="cover"
//                 />
//               </View>
//             </View>
//             <View style={styles.slideCommentContainer}>
//               <Text style={styles.slideTitle} numberOfLines={2}>
//                 {item.title}
//               </Text>
//               <Text style={styles.slideComment} numberOfLines={4}>
//                 {item.comment}
//               </Text>
//             </View>
//           </View>
//         )}
//       />
//     </View>
//   );
// };
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  useWindowDimensions
} from 'react-native';
import Swiper from 'react-native-swiper';
import { styles } from './ImageSlider.styles';
import { Image } from 'expo-image';

interface SlideItem {
  id: number;
  albumImageUrl: string;
  link: string;
  videoUrl: string;
  minBpm: number;
  maxBpm: number;
  createdAt: string;
  producer: string;
  title: string;
  symbol: {
    imageUrl: string | null;
    type: string | null;
  };
  category: string;
  subCategory: string;
  subComment: string;
}

interface ImageSliderProps {
  data: SlideItem[];
}

export const ImageSlider = ({ data }: ImageSliderProps) => {
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  const ITEM_WIDTH = Math.min(width * 0.78, 330);
  const SLIDER_HEIGHT = ITEM_WIDTH * 0.75 + 110;
  const sideGap = (width - ITEM_WIDTH) / 2;

  return (
    <View style={[styles.sliderContainer]}>
      <Swiper
        key={data.length}
        width={ITEM_WIDTH}
        // height={SLIDER_HEIGHT}
        autoplay={true}
        autoplayTimeout={5}
        loop={false}
        showsPagination={true}
        dot={<View style={styles.dot} />}
        activeDot={<View style={[styles.dot, styles.activeDot]} />}
        paginationStyle={{
          bottom: -30
        }}
        removeClippedSubviews={false}
        style={{ overflow: 'visible', alignSelf: 'center' }}
        containerStyle={{ overflow: 'visible' }}
        onIndexChanged={(index) => setCurrentIndex(index)}
        loadMinimal={true}
        loadMinimalSize={1}
        bounces={true}
        scrollEventThrottle={16}
        hitSlop={{ left: sideGap, right: sideGap, top: 0, bottom: 0 }}
        {...({
          // scrollViewStyle: { overflow: 'visible' }
        } as any)}
      >
        {data.map((item, index) =>
          <SlideItem key={item.id} item={item} index={index} currentIndex={currentIndex} />
        )}
      </Swiper>
    </View>
  );
};


const SlideItem = ({ item, index, currentIndex }: { item: SlideItem; index: number; currentIndex: number }) => {
  // 1. 애니메이션에 사용할 변수 생성 (기본값 0.8)
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // 2. 현재 활성화된 슬라이드라면 scale을 1로, 아니면 0.8로 부드럽게 변경
    Animated.timing(scaleAnim, {
      toValue: index === currentIndex ? 1 : 0.8,
      duration: 150, // 애니메이션 속도 (ms단위, 0.3초)
      useNativeDriver: true, // 네이티브 드라이버를 써서 60fps로 부드럽게 작동
    }).start();
  }, [currentIndex]); // 현재 인덱스가 바뀔 때마다 실행

  return (
    <Animated.View
      style={[
        styles.slideItem,
        {
          // width: ITEM_WIDTH,
          transform: [{ scale: scaleAnim }], // ⭐ Animated 변수 적용
        }
      ]}
    >
      <View style={styles.shadowWrapper}>
        <View style={styles.slideInner}>
          <Image
            source={{ uri: item.albumImageUrl }}
            style={styles.slideImage}
            contentFit="cover"
          />
          <View>
            <View>
              <Text>{item.symbol.type}</Text>
            </View>
            <View>
              <Text>{item.category}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.slideCommentContainer}>
        <Text style={styles.slideTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.slideComment} numberOfLines={4}>
          {item.subComment}
        </Text>
      </View>
    </Animated.View>
  );
}

