import { StopwatchSprint } from "@/components/stopwatch";
import { Colors } from "@/constants/Colors";
import { useStopwatchStore } from "@/hooks/useStopwatchStore";
import { useAgendaStore } from "@/store/useAgendaStore";
import useUsersStore, { ITrainingRecord } from "@/store/useUsersStore";
import {
  capitalize,
  getTodayKey,
  today,
  toMinute,
  toMinuteFromMili,
} from "@/utils/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Training = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { users, addTrainingRecord } = useUsersStore();
  const { programs } = useAgendaStore();
  const { results, resetAll } = useStopwatchStore();

  const user = users.find((u) => u.id === userId);
  const todayProgram = programs[today] || { sprint: [] };
  const sprints = todayProgram.sprint;

  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const stylesList = useMemo(() => {
    return Array.from(
      new Set(
        sprints
          .map((s) =>
            s.gaya && s.volume && s.jarak
              ? JSON.stringify({
                  gaya: s.gaya,
                  volume: s.volume,
                  jarak: s.jarak,
                })
              : null
          )
          .filter((v): v is string => v !== null)
      )
    ).map((item) => JSON.parse(item));
  }, [sprints]);

  const selected = useMemo(
    () => stylesList[selectedStyleIndex],
    [stylesList, selectedStyleIndex]
  );

  const selectedInterval = useMemo(() => {
    return (
      sprints.find(
        (s) =>
          s.gaya === selected.gaya &&
          s.volume === selected.volume &&
          s.jarak === String(selected.jarak)
      )?.interval || 0
    );
  }, [sprints, selected]);

  const allStylesCompleted = useMemo(() => {
    return stylesList.every((s) => {
      const key = `${s.gaya}-${s.volume}-${s.jarak}`;
      return results[key]?.length > 0;
    });
  }, [stylesList, results]);

  const handleSaveResults = useCallback(() => {
    setShowSummary(false);

    let fiftyTimes: number[] = [];
    let hundredTimes: number[] = [];

    // Kumpulkan semua lap dari semua style
    Object.entries(results).forEach(([key, laps]) => {
      const [style, volume, jarak] = key.split("-");

      laps.forEach((lap) => {
        if (jarak === "50") {
          fiftyTimes.push(lap.time);
        } else if (jarak === "100") {
          hundredTimes.push(lap.time);
        }
      });
    });

    const record: ITrainingRecord = {
      date: getTodayKey(),
      program: programs[today]!,
      fiftyValue: fiftyTimes.length ? Math.min(...fiftyTimes) : 0,
      hundredValue: hundredTimes.length ? Math.min(...hundredTimes) : 0,
    };

    addTrainingRecord(String(userId), record);
    resetAll();
    router.replace(`/user-detail?userId=${userId}`);
  }, [results, programs, userId, addTrainingRecord, resetAll, router]);

  if (!user) return <Text>Loading...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sprint Training - {user.name}</Text>

      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          <View style={styles.tabContainer}>
            {stylesList.map((style, index) => {
              const label = `${style.volume} x ${style.jarak}m ${
                style.gaya
              }, Interval ${toMinute(
                Number(
                  sprints.find(
                    (s) =>
                      s.gaya === style.gaya &&
                      s.volume === style.volume &&
                      String(s.jarak) === String(style.jarak)
                  )?.interval || "-"
                )
              )} Menit`;

              const key = `${style.gaya}-${style.volume}-${style.jarak}`;
              const isDone = results[key]?.length === style.jarak;

              return (
                <StyleTab
                  key={index}
                  label={label}
                  active={index === selectedStyleIndex}
                  onPress={() => setSelectedStyleIndex(index)}
                  disabled={isDone}
                />
              );
            })}
          </View>

          {stylesList.length > 0 ? (
            <StopwatchSprint
              key={`${selected.gaya}-${selected.volume}-${selected.jarak}`}
              styleName={selected.gaya}
              volumes={Array(Number(selected.jarak)).fill(selected.volume)}
              tabKey={`${selected.gaya}-${selected.volume}-${selected.jarak}`}
              interval={selectedInterval}
              autoLap={false} // default awalnya OFF
              onFinish={() => setShowSummary(true)}
            />
          ) : (
            <Text>Tidak ada program sprint hari ini.</Text>
          )}
        </View>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: allStylesCompleted ? "#2196F3" : "#ccc" },
            ]}
            disabled={!allStylesCompleted}
            onPress={() => setShowSummary(true)}
          >
            <Text style={styles.saveText}>Selesai</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace(`/user-detail?userId=${userId}`)}
          >
            <Text style={styles.backText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* modal */}
      <Modal visible={showSummary} animationType="slide" transparent>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hasil Sementara</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Object.entries(results).map(([key, laps], i) => {
                const [gaya, volume, jarak] = key.split("-");
                const times = laps.map((l) => l.time);
                const fastest = Math.min(...times);
                const slowest = Math.max(...times);

                return (
                  <View key={i} style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultGaya}>{capitalize(gaya)}</Text>
                      <Text style={styles.resultInfo}>
                        {volume} x {jarak}m
                      </Text>
                    </View>

                    <View style={styles.lapList}>
                      {laps.map((lap, j) => (
                        <Text
                          key={j}
                          style={[
                            styles.lapTime,
                            {
                              color:
                                lap.time === fastest
                                  ? "#4CAF50"
                                  : lap.time === slowest
                                  ? "#F44336"
                                  : "#212121",
                            },
                          ]}
                        >
                          • {toMinuteFromMili(lap.time)}
                        </Text>
                      ))}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.closeButton,
                { marginTop: 10, backgroundColor: Colors.light.success },
              ]}
              onPress={handleSaveResults}
            >
              <Text style={[styles.closeText, { color: "#fff" }]}>
                Simpan & Kembali
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSummary(false)}
            >
              <Text style={styles.closeText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Training;

const StyleTab = ({
  label,
  active,
  onPress,
  disabled,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.tab, active && styles.tabActive]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.light.background },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  text: { textAlign: "center", marginTop: 40 },

  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#eee",
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: Colors.light.success,
  },
  tabText: {
    color: "#000",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },

  bottomButtons: {
    flexDirection: "column",
    gap: 10,
    marginTop: 24,
  },
  saveButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
  backButton: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    color: "#000",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  backText: {
    color: "#000",
    fontWeight: "600",
  },

  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  resultItem: { paddingVertical: 8 },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#fff",
    color: "#000",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    borderColor: Colors.light.border,
  },
  closeText: { color: "#000", fontWeight: "600" },
  resultHeader: {
    flexDirection: "column",
    // justifyContent: "space-between",
    marginBottom: 8,
  },
  resultGaya: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  resultInfo: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  resultCard: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginRight: 12,
    width: 160, // biar card-nya seragam & enak discroll
    borderWidth: 1,
    borderColor: "#eee",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  lapList: {
    paddingLeft: 8,
    paddingTop: 4,
  },
  lapTime: {
    fontSize: 14,
    marginBottom: 4,
  },
});
