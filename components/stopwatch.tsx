import { Typography } from "@/constants/Typhography";
import { useStopwatchStore } from "@/hooks/useStopwatchStore";
import { formatMillis } from "@/utils/utils";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Colors = {
  success: "#2B8C45",
  danger: "#B62616",
  primary: "#3F72AF",
  text: "#212121",
  background: "#ffffff",
  lap: "#333333",
};

type Lap = { time: number; style: string; volume: string };
type LapData = Lap & { splitTime: number; index: number };

type Props = {
  styleName: string;
  volumes: string[];
  tabKey: string;
  interval?: number; // dalam detik
  autoLap?: boolean;
  onFinish?: () => void;
};

export const StopwatchSprint: React.FC<Props> = ({
  styleName,
  volumes,
  tabKey,
  onFinish,
  autoLap,
  interval,
}) => {
  const { results, setLaps } = useStopwatchStore();
  const existingLaps = results[tabKey] ?? [];

  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [lapTime, setLapTime] = useState(0);
  const [laps, setLocalLaps] = useState<Lap[]>(existingLaps);
  const [autoLapEnabled, setAutoLapEnabled] = useState(autoLap ?? false);

  const lastAutoLapTrigger = useRef<number>(0);
  const autoLapRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lapStartTimeRef = useRef<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setLocalLaps(existingLaps);
  }, [tabKey]);

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
      const ts = Date.now();
      setCurrentTime(ts - (startTimeRef.current ?? ts));
      setLapTime(ts - (lapStartTimeRef.current ?? ts));
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
    setLaps(tabKey, newLaps);
    if (newLaps.length === volumes.length) {
      stop();
      onFinish?.();
    } else {
      lapStartTimeRef.current = now;
      setLapTime(0);
    }
  };

  const lapData: LapData[] = useMemo(() => {
    return laps.map((l, idx) => {
      const splitTime = laps
        .slice(0, idx + 1)
        .reduce((sum, cur) => sum + cur.time, 0);
      return { ...l, splitTime, index: idx };
    });
  }, [laps]);

  const fastest = useMemo(
    () => (laps.length ? Math.min(...laps.map((l) => l.time)) : 0),
    [laps]
  );
  const slowest = useMemo(
    () => (laps.length ? Math.max(...laps.map((l) => l.time)) : 0),
    [laps]
  );

  const reset = useCallback(() => {
    setCurrentTime(0);
    setLapTime(0);
    setLocalLaps([]);
    setLaps(tabKey, []);
    startTimeRef.current = null;
    lapStartTimeRef.current = null;
  }, [setLaps, tabKey]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoLapRef.current) clearTimeout(autoLapRef.current);
    };
  }, []);

  useEffect(() => {
    if (lapData.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [lapData]);

  useEffect(() => {
    if (isRunning && autoLapEnabled && interval) {
      const intervalInMs = interval * 1000;

      if (
        currentTime - lastAutoLapTrigger.current >= intervalInMs &&
        currentTime % intervalInMs < 100
      ) {
        lapStartTimeRef.current = Date.now();
        setLapTime(0);
        lastAutoLapTrigger.current = currentTime;
      }
    }
  }, [currentTime, isRunning, autoLapEnabled, interval]);

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatMillis(currentTime)}</Text>
      <Text style={styles.lapText}>{formatMillis(lapTime)}</Text>

      {/* button */}
      <View style={styles.buttonContainer}>
        {!isRunning ? (
          laps.length > 0 ? (
            <>
              <TouchableOpacity style={styles.stopButton} onPress={reset}>
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

      <View style={styles.autoLapContainer}>
        <TouchableOpacity
          style={[
            styles.autoLapToggle,
            autoLapEnabled && styles.autoLapToggleActive,
            isRunning && styles.autoLapToggleDisabled,
          ]}
          onPress={() => {
            if (!isRunning) setAutoLapEnabled((prev) => !prev);
          }}
          disabled={isRunning}
        >
          <Text style={styles.autoLapText}>
            Auto Reset Lap: {autoLapEnabled ? "ON" : "OFF"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Wrapper tambahan untuk area scrollable */}
      <View style={styles.flatListContainer}>
        <FlatList
          ref={flatListRef}
          data={lapData}
          keyExtractor={(item) => `${tabKey}-${item.index}`}
          renderItem={({ item }) => {
            const lapColor =
              item.time === fastest
                ? Colors.success
                : item.time === slowest
                ? Colors.danger
                : Colors.text;
            return (
              <View style={styles.lapCard}>
                <View style={styles.lapCardHeader}>
                  <Text style={styles.lapCardTitle}>Lap {item.index + 1}</Text>
                  <Text style={[styles.lapCardTitle, { color: lapColor }]}>
                    {formatMillis(item.time)}
                  </Text>
                </View>
                <View style={styles.lapCardRow}>
                  <Text style={styles.lapLabel}>Split</Text>
                  <Text style={styles.lapValue}>
                    {formatMillis(item.splitTime)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 5, paddingHorizontal: 20 },
  autoLapContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  autoLapToggle: {
    backgroundColor: "#CCCCCC",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 14,
  },
  autoLapToggleActive: {
    backgroundColor: Colors.success,
  },
  autoLapText: {
    color: "#fff",
    fontFamily: Typography.semiBold,
    paddingBottom: 2,
    fontSize: 12,
  },

  flatListContainer: {
    maxHeight: 280, // Sesuaikan sesuai kebutuhan tinggi maksimal area scroll
    width: "100%",
  },

  // timer
  timerText: {
    fontSize: 48,
    fontFamily: Typography.bold,
    textAlign: "center",
    color: Colors.text,
  },
  autoLapToggleDisabled: {
    opacity: 0.5,
  },

  lapText: {
    fontSize: 24,
    fontFamily: Typography.bold,
    textAlign: "center",
    marginBottom: 16,
    color: Colors.lap,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
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
    fontFamily: Typography.bold,
    paddingBottom: 3,
    fontSize: 16,
  },
  lapCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    width: "100%",
  },
  lapCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  lapCardTitle: {
    fontSize: 14,
    fontFamily: Typography.semiBold,
    color: Colors.text,
  },
  lapCardRow: { flexDirection: "row", justifyContent: "space-between" },
  lapLabel: { fontSize: 11, color: "#555555", fontFamily: Typography.medium },
  lapValue: {
    fontSize: 11,
    fontWeight: "500",
    color: "#111111",
    fontFamily: Typography.medium,
  },
});
