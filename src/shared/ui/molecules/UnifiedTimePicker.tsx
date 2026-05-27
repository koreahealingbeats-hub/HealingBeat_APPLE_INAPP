import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

interface UnifiedTimePickerProps {
  value: Date;
  onChange: (event: any, date?: Date) => void;
  hourLabel?: string;
  minuteLabel?: string;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;

/**
 * [UnifiedTimePicker]
 * iOS와 Android에서 일관된 디자인을 제공하는 크로스 플랫폼 시간 선택기입니다.
 * ScrollView를 사용하여 "휠 피커(Wheel Picker)" UI를 모방했습니다.
 */
export const UnifiedTimePicker = ({ value, onChange }: UnifiedTimePickerProps) => {
  const [hour, setHour] = useState(value.getHours());
  const [minute, setMinute] = useState(value.getMinutes());

  // 시간(0-23)과 분(0-59) 배열 생성
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    setHour(value.getHours());
    setMinute(value.getMinutes());
  }, [value]);

  const updateTime = (newHour: number, newMinute: number) => {
    // 낙관적 업데이트 (Optimistic update)
    setHour(newHour);
    setMinute(newMinute);
    
    // 현재 값을 기반으로 새로운 날짜 객체 생성
    const newDate = new Date(value);
    newDate.setHours(newHour);
    newDate.setMinutes(newMinute);
    
    // 이벤트 객체(mock)와 새로운 날짜 전달
    onChange({ type: 'set', nativeEvent: { timestamp: newDate.getTime() } }, newDate);
  };

  return (
    <View style={styles.container}>
      <TimeColumn 
        items={hours} 
        selectedValue={hour} 
        onSelect={(h) => updateTime(h, minute)} 
      />
      <Text style={styles.colon}>:</Text>
      <TimeColumn 
        items={minutes} 
        selectedValue={minute} 
        onSelect={(m) => updateTime(hour, m)} 
      />
    </View>
  );
};

interface TimeColumnProps {
  items: number[];
  selectedValue: number;
  onSelect: (val: number) => void;
}

const TimeColumn = ({ items, selectedValue, onSelect }: TimeColumnProps) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // 초기 스크롤 위치 설정
    if (scrollViewRef.current) {
      const index = items.indexOf(selectedValue);
      if (index !== -1) {
        scrollViewRef.current.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
      }
    }
  }, []); // Only on mount

  // 외부에서 selectedValue가 변경될 때의 처리는 선택 사항입니다.
  // 사용자가 드래그 중일 때 자동으로 스크롤하면 화면이 떨릴 수 있으므로 주의해야 합니다.
  // 현재는 onMomentumScrollEnd를 통해 상태를 업데이트하고 있습니다.
  // 초기 값 설정(마운트 시)은 위의 useEffect가 담당합니다.

  return (
    <View style={styles.columnContainer}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
        onMomentumScrollEnd={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const index = Math.round(y / ITEM_HEIGHT);
          if (items[index] !== undefined) {
            onSelect(items[index]);
          }
        }}
      >
        {items.map((item) => (
          <TouchableOpacity 
            key={item} 
            style={[styles.item, item === selectedValue && styles.selectedItem]}
            onPress={() => {
              onSelect(item);
              scrollViewRef.current?.scrollTo({ y: items.indexOf(item) * ITEM_HEIGHT, animated: true });
            }}
          >
            <Text style={[styles.itemText, item === selectedValue && styles.selectedItemText]}>
              {item < 10 ? `0${item}` : item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* 선택된 항목 표시선 (오버레이) */}
      <View style={styles.selectionOverlay} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnContainer: {
    height: '100%',
    width: 60,
    alignItems: 'center',
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 20,
    color: '#ccc',
  },
  selectedItem: {
    // 배경 하이라이트는 오버레이가 처리하므로, 여기서는 텍스트 상태만 관리
  },
  selectedItemText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  colon: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingBottom: 4, // 시각적 정렬 보정
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT, // 중앙 아이템과 위치 맞춤 (상단 패딩이 아이템 1개 높이이므로)
    height: ITEM_HEIGHT,
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
});
