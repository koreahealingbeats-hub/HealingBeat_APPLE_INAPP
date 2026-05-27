import { useState } from 'react';
import { NotificationService } from '@/shared/lib/notification/NotificationService';

export const useSleepSettings = ({ navigation }: any) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [wakeTime, setWakeTime] = useState({ hour: 7, minute: 0 });
  const [routineDuration, setRoutineDuration] = useState({ hour: 0, minute: 30 });
  
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const toggleSwitch = async () => {
    if (!isEnabled) {
      const granted = await NotificationService.requestPermissions();
      if (granted) {
        setIsEnabled(true);
        await NotificationService.scheduleAlarm(wakeTime.hour, wakeTime.minute, [0,1,2,3,4,5,6]);
      } else {
        alert('알람 권한이 필요합니다');
      }
    } else {
      setIsEnabled(false);
      await NotificationService.cancelAll();
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const newHour = selectedDate.getHours();
      const newMinute = selectedDate.getMinutes();
      setWakeTime({ hour: newHour, minute: newMinute });
      
      if (isEnabled) {
        NotificationService.scheduleAlarm(newHour, newMinute, [0,1,2,3,4,5,6]);
      }
    }
  };

  const onDurationChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const newHour = selectedDate.getHours();
      const newMinute = selectedDate.getMinutes();
      setRoutineDuration({ hour: newHour, minute: newMinute });
    }
  };

  const startSleepMode = () => {
    const totalMinutes = routineDuration.hour * 60 + routineDuration.minute;
    if (totalMinutes === 0) {
      alert('루틴 시간을 설정해주세요');
      return;
    }
    navigation.navigate('SleepMode', { duration: totalMinutes });
  };

  const closePickers = () => {
    setShowTimePicker(false);
    setShowDurationPicker(false);
  };

  const formatDuration = (h: number, m: number) => {
    if (h > 0 && m > 0) return `${h}시간 ${m}분`;
    if (h > 0) return `${h}시간`;
    return `${m}분`;
  };

  return {
    isEnabled,
    wakeTime,
    routineDuration,
    showTimePicker,
    setShowTimePicker,
    showDurationPicker,
    setShowDurationPicker,
    toggleSwitch,
    onTimeChange,
    onDurationChange,
    startSleepMode,
    closePickers,
    formatDuration,
  };
};
