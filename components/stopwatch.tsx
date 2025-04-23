import { useStopwatchStore } from "@/hooks/useStopwatchStore";
import { formatMillis } from "@/utils/utils";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Lap = {
  time: number;
  style: string;
  volume: string;
};

type Props = {
  styleName: string;
  volumes: string[];
  tabKey: string; // NEW: unik untuk gaya+volume
  onFinish?: () => void; // opsional
};

const Colors = {
  success: "#4CAF50",
  danger: "#F44336",
  primary: "#2196F3",
  text: "#212121",
  background: "#ffffff",
  lap: "#333333",
};

export const StopwatchSprint: React.FC<Props> = ({
  styleName,
  volumes,
  tabKey,
  onFinish,
}) => {
  const { results, setLaps } = useStopwatchStore();
  const existingLaps = results[tabKey] ?? [];

  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [lapTime, setLapTime] = useState(0);
  const [laps, setLocalLaps] = useState<Lap[]>(existingLaps);

  const timerRef = useRef<NodeJS.Timer | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lapStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setLocalLaps(existingLaps);
  }, [tabKey]); // update saat pindah tab

  const start = () => {
    const now = Date.now();
    if (startTimeRef.current === null) {
      startTimeRef.current = now;
      lapStartTimeRef.current = now;
    } else {
      startTimeRef.current = now - currentTime;
      lapStartTimeRef.current = now - lapTime;
    }

    setIsRunning(true);

    timerRef.current = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now - (startTimeRef.current ?? now));
      setLapTime(now - (lapStartTimeRef.current ?? now));
    }, 100);
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
  };

  const lap = () => {
    if (laps.length >= volumes.length) return;

    const now = Date.now();
    const newLapTime = now - (lapStartTimeRef.current ?? now);
    const volume = volumes[laps.length];

    const newLaps = [...laps, { time: newLapTime, style: styleName, volume }];
    setLocalLaps(newLaps);
    setLaps(tabKey, newLaps); // persist ke zustand

    if (newLaps.length === volumes.length) {
      stop();
      onFinish?.(); // jika disediakan, panggil
    } else {
      lapStartTimeRef.current = now;
      setLapTime(0);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fastest = Math.min(...laps.map((l) => l.time));
  const slowest = Math.max(...laps.map((l) => l.time));

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatMillis(currentTime)}</Text>
      <Text style={styles.lapText}>{formatMillis(lapTime)}</Text>

      <View style={styles.buttonContainer}>
        {!isRunning ? (
          laps.length > 0 ? (
            <>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={() => {
                  setCurrentTime(0);
                  setLapTime(0);
                  setLocalLaps([]);
                  setLaps(tabKey, []);
                  startTimeRef.current = null;
                  lapStartTimeRef.current = null;
                }}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.lapButton} onPress={start}>
                <Text style={styles.buttonText}>Resume</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={() => {
                  setCurrentTime(0);
                  setLapTime(0);
                  setLocalLaps([]);
                  setLaps(tabKey, []);
                  startTimeRef.current = null;
                  lapStartTimeRef.current = null;
                }}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.startButton} onPress={start}>
                <Text style={styles.buttonText}>Start</Text>
              </TouchableOpacity>
            </>
          )
        ) : (
          <>
            <TouchableOpacity style={styles.stopButton} onPress={stop}>
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.lapButton} onPress={lap}>
              <Text style={styles.buttonText}>Lap</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <FlatList
        data={laps}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => {
          const color =
            item.time === fastest
              ? Colors.success
              : item.time === slowest
              ? Colors.danger
              : Colors.text;

          return (
            <View style={styles.lapItem}>
              <Text style={{ color }}>
                {index + 1} - {formatMillis(item.time)}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 20, paddingHorizontal: 20 },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  lapText: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
    color: Colors.lap,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 12,
  },
  startButton: {
    backgroundColor: Colors.success,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: Colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  lapButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  lapItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
});
