import ProgramItemModal from "@/components/ProgramItemModal";
import { Colors } from "@/constants/Colors";
import { useAgendaStore } from "@/store/useAgendaStore";
import useUsersStore from "@/store/useUsersStore";
import {
  formatCategory,
  getTodayKey,
  today,
  toMinute,
  toMinuteFromMili,
} from "@/utils/utils";

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserDetail = () => {
  const { userId } = useLocalSearchParams();
  const { setSelectedDay, programs } = useAgendaStore();
  const { users, getTrainingRecords } = useUsersStore();
  const router = useRouter();
  const user = users.find((u) => u.id === userId);
  const todayProgram = programs[today] || {
    warming: [],
    main: [],
    sprint: [],
    down: [],
  };
  const trainingRecords = getTrainingRecords(String(userId));

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allProgramsFilled = Object.values(todayProgram).every(
    (items) => items.length > 0
  );

  // Fungsi untuk membuka modal
  const openModal = (category: string) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{user?.name}</Text>
            <Text style={styles.subTitle}>Best Time Renang</Text>
          </View>

          <View style={styles.timeBox}>
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>🏊‍♂️ Dada</Text>
                <Text style={styles.timeValue}>
                  {user?.chestStyle ? toMinute(user?.chestStyle) : "-"}
                </Text>
              </View>

              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>🏊‍♂️ Bebas</Text>
                <Text style={styles.timeValue}>
                  {user?.freeStyle ? toMinute(user?.freeStyle) : "-"}
                </Text>
              </View>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>🏊‍♂️ Punggung</Text>
                <Text style={styles.timeValue}>
                  {user?.backstrokeStyle
                    ? toMinute(user?.backstrokeStyle)
                    : "-"}
                </Text>
              </View>

              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>🏊‍♂️ Kupu-Kupu</Text>
                <Text style={styles.timeValue}>
                  {user?.butterflyStyle ? toMinute(user?.butterflyStyle) : "-"}
                </Text>
              </View>
            </View>
          </View>

          {/* Program Hari Ini */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Program Hari Ini ({today})</Text>
            <View style={styles.categoryContainer}>
              {["warming", "main", "sprint", "down"].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryCard}
                  onPress={() => openModal(category)}
                >
                  <Text style={styles.categoryTitle}>
                    {formatCategory(category)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hasil Sprint Hari Ini */}
          <View style={styles.trainingResultContainer}>
            {!allProgramsFilled ? (
              <View style={styles.alertBox}>
                <Text style={styles.alertText}>
                  ⚠️ Harap lengkapi semua program (Warming, Main, Sprint, Down)
                  sebelum mencatat hasil latihan sprint.
                </Text>
              </View>
            ) : trainingRecords.find((r) => r.date === getTodayKey()) ? (
              <View style={styles.resultCardV2}>
                {(() => {
                  const record = trainingRecords.find(
                    (r) => r.date === getTodayKey()
                  )!;
                  return (
                    <>
                      <Text style={styles.resultV2TextTitle}>
                        Hasil Sprint Hari Ini 🏁
                      </Text>
                      <Text style={styles.resultV2Item}>
                        50m: {toMinuteFromMili(record.fiftyValue)} menit
                      </Text>
                      <Text style={styles.resultV2Item}>
                        100m: {toMinuteFromMili(record.hundredValue)} menit
                      </Text>
                    </>
                  );
                })()}
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.addRecordButton,
                  !allProgramsFilled && { opacity: 0.5 },
                ]}
                onPress={() => {
                  if (allProgramsFilled) {
                    router.replace(`/training?userId=${userId}`);
                  }
                }}
                disabled={!allProgramsFilled}
              >
                <Text style={styles.addRecordText}>
                  ➕ Catat Latihan Hari Ini
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* button group */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push(`/history?userId=${userId}`);
            }}
          >
            <Text style={styles.buttonText}>📋 Latihan Sebelumnya</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.programButton]}
            onPress={() => {
              setSelectedDay(today);
              router.push("/programs");
            }}
          >
            <Text style={[styles.buttonText, styles.programButtonText]}>
              🏊‍♀️ Semua Program
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#34a853" }]}
            onPress={() => {}}
          >
            <Text style={styles.buttonText}>📈 Grafik</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.backButton,
              { borderColor: Colors.light.border },
            ]}
            onPress={() => router.push("/")}
          >
            <Text style={[styles.buttonText, { color: Colors.light.text }]}>
              🏠 Kembali ke Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ProgramItemModal
        visible={modalVisible}
        category={selectedCategory}
        programs={
          selectedCategory
            ? todayProgram[selectedCategory as keyof typeof todayProgram]
            : []
        }
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  subTitle: {
    fontSize: 14,
    color: Colors.light.textSecondary || "#6e6e6e",
    marginTop: 2,
  },
  buttonGroup: {
    gap: 16,
    marginBottom: 50,
  },
  button: {
    backgroundColor: "#1e88e5",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: Colors.light.background, // Warna berbeda untuk tombol kembali
    color: Colors.light.text,
    borderWidth: 1,
    // marginBottom: 70,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // marginBottom: 5,
  },
  categoryColumn: {
    width: "48%",
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  programList: {
    maxHeight: 100,
  },
  emptyText: {
    fontSize: 10,
    color: "#999",
    fontStyle: "italic",
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "space-between",
  },
  programButton: {
    backgroundColor: "#1976d2", // Biru sporty
    borderWidth: 1,
    borderColor: "#1565c0", // Biru tua sebagai aksen
  },
  programButtonText: {
    letterSpacing: 0.5,
  },
  timeBox: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 12,
    gap: 12,
  },
  section: {
    marginTop: 5,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A3C6D",
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  timeItem: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  timeLabel: {
    fontSize: 12,
    color: "#555",
  },

  timeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 4,
  },

  categorySection: {
    marginBottom: 15,
  },

  // latihan hari ini
  trainingResultContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },

  resultCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 8,
  },

  resultText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },

  resultProgramLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },

  programItem: {
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },

  programItemText: {
    fontSize: 14,
    color: "#1a237e",
    fontWeight: "500",
  },

  addRecordButton: {
    backgroundColor: "#e8f5e9",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#66bb6a",
  },

  addRecordText: {
    color: "#388e3c",
    fontWeight: "600",
    fontSize: 16,
  },
  alertBox: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 8,
    borderColor: "#ffeeba",
    borderWidth: 1,
    marginBottom: 12,
  },
  alertText: {
    color: "#856404",
    fontSize: 14,
    fontWeight: "500",
  },
  resultCardV2: {
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 10,
    gap: 6,
  },
  resultV2TextTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 6,
  },
  resultV2Item: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0d47a1",
  },
});

export default UserDetail;
