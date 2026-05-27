import { useEffect, useState, useRef } from "react";
import { Alert, Vibration, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePlayer } from "@/features/play-audio/model/usePlayer";
import { STORAGE_KEYS } from "@/shared/constants/storage";
import {
  scheduleCompletionNotification,
  cancelAllNotifications,
  requestNotificationPermissions,
} from "@/shared/lib/utils/notificationHandler";

export type TimerState = "IDLE" | "RUNNING" | "PAUSED" | "FINISHED";

export const useSleepMode = ({ route, navigation }: any) => {
  const [duration, setDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [timerState, setTimerState] = useState<TimerState>("IDLE");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { togglePlayback, isPlaying } = usePlayer();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEYS.TIMER_STATE);
        const savedDuration = await AsyncStorage.getItem(
          STORAGE_KEYS.TIMER_DURATION
        );
        const savedEndTime = await AsyncStorage.getItem(
          STORAGE_KEYS.TIMER_END_TIME
        );

        if (savedState === "RUNNING" && savedEndTime) {
          const endTime = parseInt(savedEndTime, 10);
          const now = Date.now();
          const remaining = Math.ceil((endTime - now) / 1000);

          if (remaining > 0) {
            setDuration(savedDuration ? parseInt(savedDuration, 10) : 30 * 60);
            setTimeLeft(remaining);
            setTimerState("RUNNING");
          } else {
            setTimerState("FINISHED");
            setTimeLeft(0);
          }
        }
      } catch (e) {
        console.error("Failed to load timer state", e);
      }
    };
    loadState();
  }, []);

  const saveTimerState = async (
    state: TimerState,
    currentDuration: number,
    endTime?: number
  ) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TIMER_STATE, state);
      await AsyncStorage.setItem(
        STORAGE_KEYS.TIMER_DURATION,
        currentDuration.toString()
      );
      if (endTime) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.TIMER_END_TIME,
          endTime.toString()
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.TIMER_END_TIME);
      }
    } catch (e) {
      console.error("Failed to save timer state", e);
    }
  };

  const clearTimerState = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
      await AsyncStorage.removeItem(STORAGE_KEYS.TIMER_END_TIME);
      await AsyncStorage.setItem(STORAGE_KEYS.TIMER_STATE, "IDLE");
    } catch (e) {
      console.error("Failed to clear timer state", e);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: timerState === "IDLE" || timerState === "FINISHED",
    });

    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (timerState === "FINISHED") {
        e.preventDefault();
        setTimerState("IDLE");
        return;
      }

      if (timerState !== "RUNNING" && timerState !== "PAUSED") {
        return;
      }

      e.preventDefault();

      Alert.alert(
        "집중 모드 종료",
        "타이머가 작동 중입니다. 정말 종료하시겠습니까?",
        [
          { text: "취소", style: "cancel", onPress: () => {} },
          {
            text: "종료",
            style: "destructive",
            onPress: () => {
              stopTimer();
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, timerState]);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: any) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (timerState === "RUNNING") {
          const savedEndTime = await AsyncStorage.getItem(
            STORAGE_KEYS.TIMER_END_TIME
          );
          if (savedEndTime) {
            const endTime = parseInt(savedEndTime, 10);
            const now = Date.now();
            const remaining = Math.ceil((endTime - now) / 1000);

            if (remaining <= 0) {
              finishRoutine();
            } else {
              setTimeLeft(remaining);
            }
          }
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [timerState]);

  useEffect(() => {
    if (timerState === "RUNNING") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishRoutine();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState]);

  const startTimer = async (overrideDuration?: number) => {
    const targetDuration =
      typeof overrideDuration === "number" ? overrideDuration : duration;

    const now = Date.now();
    const endTime = now + targetDuration * 1000;

    setTimeLeft(targetDuration);
    setTimerState("RUNNING");
    saveTimerState("RUNNING", targetDuration, endTime);

    await cancelAllNotifications();
    await scheduleCompletionNotification(targetDuration);
  };

  const stopTimer = async () => {
    setTimerState("IDLE");
    if (timerRef.current) clearInterval(timerRef.current);
    clearTimerState();
    await cancelAllNotifications();
  };

  const finishRoutine = async () => {
    setTimerState("FINISHED");
    if (timerRef.current) clearInterval(timerRef.current);
    clearTimerState();

    if (isPlaying) {
      togglePlayback();
    }

    await cancelAllNotifications();
    Vibration.vibrate([0, 500, 200, 500]);
    Vibration.vibrate([0, 500, 200, 500]);
  };

  return {
    duration,
    setDuration,
    timeLeft,
    setTimeLeft,
    timerState,
    setTimerState,
    isPlaying,
    togglePlayback,
    startTimer,
    stopTimer,
  };
};
