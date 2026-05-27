import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { PomodoroTimer } from "@/features/pomodoro-timer/ui/PomodoroTimer";
import { HoldToStopButton } from "@/shared/ui";
import { useSleepMode } from "../model/useSleepMode";

export const SleepMode = ({ route, navigation }: any) => {
  const {
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
  } = useSleepMode({ route, navigation });

  const renderContent = () => {
    switch (timerState) {
      case "IDLE":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.title}>집중 타이머</Text>
            <PomodoroTimer
              duration={duration}
              timeLeft={duration}
              isRunning={false}
              onDurationChange={(val) => {
                setDuration(val);
                setTimeLeft(val);
              }}
            />
            <TouchableOpacity
              style={[
                styles.startButton,
                duration === 0 && { opacity: 0.3, backgroundColor: "#555" },
              ]}
              onPress={() => startTimer()}
              disabled={duration === 0}
            >
              <Text style={styles.startButtonText}>시작</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.startButton,
                { marginTop: 20, backgroundColor: "#007AFF" },
              ]}
              onPress={() => startTimer(5)}
            >
              <Text style={[styles.startButtonText, { fontSize: 16 }]}>
                테스트 (5초)
              </Text>
            </TouchableOpacity>
          </View>
        );
      case "RUNNING":
      case "PAUSED":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.title}>집중 중...</Text>
            <PomodoroTimer
              duration={duration}
              timeLeft={timeLeft}
              isRunning={true}
              onDurationChange={() => {}}
            />

            <View style={styles.controlsContainer}>
              <HoldToStopButton onStop={stopTimer} duration={1500} />
            </View>
          </View>
        );
      case "FINISHED":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.finishText}>완료!</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => setTimerState("IDLE")}
            >
              <Text style={styles.startButtonText}>돌아가기</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}

      <View style={styles.playerContainer}>
        <TouchableOpacity onPress={togglePlayback}>
          <Text style={styles.playerText}>
            {isPlaying ? "음악 일시정지" : "음악 재생"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d1f",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  startButton: {
    marginTop: 40,
    backgroundColor: "#FF9500",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  finishText: {
    color: "#4CD964",
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 30,
  },
  controlsContainer: {
    width: "80%",
    marginTop: 20,
  },
  playerContainer: {
    marginBottom: 30,
    padding: 10,
  },
  playerText: {
    color: "#666",
    fontSize: 14,
  },
});
