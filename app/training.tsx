import { StopwatchSprint } from "@/components/stopwatch";
import { Colors } from "@/constants/Colors";
import { useStopwatchStore } from "@/hooks/useStopwatchStore";
import { useAgendaStore } from "@/store/useAgendaStore";
import useUsersStore, { ITrainingRecord } from "@/store/useUsersStore";
import { today } from "@/utils/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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

  const user = users.find((u) => u.id === userId);
  const todayProgram = programs[today] || {
    warming: [],
    main: [],
    sprint: [],
    down: [],
  };
  const sprints = todayProgram.sprint;

  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const [results, setResults] = useState<ITrainingRecord[]>([]);
  const [completedStyles, setCompletedStyles] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const stylesList = Array.from(
    new Set(
      sprints
        .map((s) => {
          if (s.gaya && s.volume && s.jarak) {
            return JSON.stringify({
              gaya: s.gaya,
              volume: s.volume,
              jarak: s.jarak,
            });
          }
          return null;
        })
        .filter((v): v is string => v !== null)
    )
  ).map(
    (item) =>
      JSON.parse(item) as { gaya: string; volume: string; jarak: number }
  );

  const selected = stylesList[selectedStyleIndex];

  const handleFinish = (
    laps: { time: number; style: string; volume: string }[]
  ) => {
    const records: ITrainingRecord[] = laps.map((lap) => ({
      date: Date.now(),
      program: {
        volume: lap.volume,
        gaya: lap.style,
        jarak: null,
        alat: null,
        interval: null,
      },
      fiftyValue: lap.volume === "50" ? lap.time : 0,
      hundredValue: lap.volume === "100" ? lap.time : 0,
    }));

    const label = `${laps[0].volume} x ${laps.length}m ${laps[0].style}`;
    setResults((prev) => [...prev, ...records]);
    setCompletedStyles((prev) => [...new Set([...prev, label])]);
    setShowSummary(true);
  };

  const handleSaveResults = () => {
    const allResults = Object.values(
      useStopwatchStore.getState().results
    ).flat();

    const records: ITrainingRecord[] = allResults.map((lap) => ({
      date: Date.now(),
      program: {
        volume: lap.volume,
        gaya: lap.style,
        jarak: null,
        alat: null,
        interval: null,
      },
      fiftyValue: lap.volume === "50" ? lap.time : 0,
      hundredValue: lap.volume === "100" ? lap.time : 0,
    }));

    records.forEach((r) => addTrainingRecord(String(userId), r));
    useStopwatchStore.getState().resetAll();
    router.replace(`/user-detail?${userId}`);
  };

  const allStylesCompleted = completedStyles.length === stylesList.length;

  if (!user) return <Text>Loading...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sprint Training - {user.name}</Text>

      <View style={{ flex: 1, justifyContent: "space-between" }}>
        {/* Style Tabs */}
        <View>
          <View style={styles.tabContainer}>
            {stylesList.map((style, index) => {
              const label = `${style.volume} x ${style.jarak}m ${style.gaya}`;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tab,
                    index === selectedStyleIndex && styles.tabActive,
                  ]}
                  onPress={() => setSelectedStyleIndex(index)}
                  disabled={completedStyles.includes(label)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      index === selectedStyleIndex && styles.tabTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {stylesList.length > 0 ? (
            <StopwatchSprint
              key={`${selected.gaya}-${selected.volume}-${selected.jarak}`}
              styleName={selected.gaya}
              volumes={Array(Number(selected.jarak)).fill(selected.volume)}
              tabKey={`${selected.gaya}-${selected.volume}-${selected.jarak}`}
              onFinish={() => {
                const label = `${selected.volume} x ${selected.jarak}m ${selected.gaya}`;
                setCompletedStyles((prev) => [...new Set([...prev, label])]);
                setShowSummary(true);
              }}
            />
          ) : (
            <Text style={styles.text}>Tidak ada program sprint hari ini.</Text>
          )}
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: allStylesCompleted ? "#2196F3" : "#ccc",
              },
            ]}
            disabled={!allStylesCompleted}
            onPress={handleSaveResults}
          >
            <Text style={styles.saveText}>Simpan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.backButton]}
            onPress={() => router.replace(`/user-detail?${userId}`)}
          >
            <Text style={styles.backText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal */}
      <Modal visible={showSummary} animationType="slide" transparent>
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hasil Latihan</Text>
            <ScrollView>
              {results.map((r, i) => (
                <View key={i} style={styles.resultItem}>
                  <Text>{`${r.program.gaya} - ${r.program.volume}m : ${
                    r.fiftyValue || r.hundredValue
                  }ms`}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.closeButton]}
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
    backgroundColor: "#999",
    borderRadius: 10,
    alignItems: "center",
    color: "#000",
  },
  backText: {
    color: "#fff",
    fontWeight: "600",
  },

  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  resultItem: { paddingVertical: 8 },
  closeButton: {
    marginTop: 16,
    backgroundColor: Colors.light.success,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeText: { color: "#fff", fontWeight: "600" },
});

export default Training;
