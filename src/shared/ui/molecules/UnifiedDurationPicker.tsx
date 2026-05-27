import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface UnifiedDurationPickerProps {
  initialDuration: number; // 초(seconds) 단위
  onChange: (duration: number) => void;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;

/**
 * [통합 지속 시간 선택기 (UnifiedDurationPicker)]
 * 시, 분, 초를 선택할 수 있는 컴포넌트입니다.
 */
export const UnifiedDurationPicker = ({ initialDuration, onChange }: UnifiedDurationPickerProps) => {
  const [hours, setHours] = useState(Math.floor(initialDuration / 3600));
  const [minutes, setMinutes] = useState(Math.floor((initialDuration % 3600) / 60));
  const [seconds, setSeconds] = useState(initialDuration % 60);

  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);
  const secondsList = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    const total = hours * 3600 + minutes * 60 + seconds;
    onChange(total);
  }, [hours, minutes, seconds]);

  const TimeColumn = ({ 
    items, 
    selectedValue, 
    onSelect,
    label
  }: { 
    items: number[], 
    selectedValue: number, 
    onSelect: (val: number) => void,
    label: string
  }) => {
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
      // 초기 스크롤 위치 설정
      setTimeout(() => {
        if (scrollViewRef.current) {
            const index = items.indexOf(selectedValue);
            if (index !== -1) {
              scrollViewRef.current.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
            }
        }
      }, 0);
    }, []);

    return (
      <View style={styles.columnContainer}>
        <Text style={styles.headerLabel}>{label}</Text>
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

  return (
    <View style={styles.container}>
      <TimeColumn items={hoursList} selectedValue={hours} onSelect={setHours} label="시간" />
      <Text style={styles.colon}>:</Text>
      <TimeColumn items={minutesList} selectedValue={minutes} onSelect={setMinutes} label="분" />
      <Text style={styles.colon}>:</Text>
      <TimeColumn items={secondsList} selectedValue={seconds} onSelect={setSeconds} label="초" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: ITEM_HEIGHT * VISIBLE_ITEMS + 30, // 라벨 공간(+30) 포함
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  columnContainer: {
    height: '100%',
    width: 70,
    alignItems: 'center',
  },
  headerLabel: {
      position: 'absolute',
      top: -20,
      fontSize: 12,
      color: '#888',
      fontWeight: '600',
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
  },
  selectedItemText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  colon: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingBottom: 4, 
    marginTop: 20, // 스크롤 영역과 정렬 맞춤
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT, 
    height: ITEM_HEIGHT,
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
});
