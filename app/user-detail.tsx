import ProgramItemModal from "@/components/ProgramItemModal";
import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typhography";
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
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserDetail = () => {
  const { userId } = useLocalSearchParams();
  const { setSelectedDay, programs } = useAgendaStore();
  const { users, getTrainingRecords } = useUsersStore();
  const router = useRouter();

  const user = useMemo(
    () => users.find((u) => u.id === userId),
    [users, userId]
  );
  const todayProgram = programs[today] || {
    warming: [],
    main: [],
    sprint: [],
    down: [],
  };
  const trainingRecords = useMemo(
    () => getTrainingRecords(String(userId)),
    [getTrainingRecords, userId]
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allProgramsFilled = Object.values(todayProgram).every(
    (items) => items.length > 0
  );

  const openModal = useCallback((category: string) => {
    setSelectedCategory(category);
    setModalVisible(true);
  }, []);

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
                <Text style={styles.timeLabel}> Dada</Text>
                <Text style={styles.timeValue}>
                  {user?.chestStyle ? toMinute(user?.chestStyle) : "-"}
                </Text>
              </View>

              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}> Bebas</Text>
                <Text style={styles.timeValue}>
                  {user?.freeStyle ? toMinute(user?.freeStyle) : "-"}
                </Text>
              </View>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}> Punggung</Text>
                <Text style={styles.timeValue}>
                  {user?.backstrokeStyle
                    ? toMinute(user?.backstrokeStyle)
                    : "-"}
                </Text>
              </View>

              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}> Kupu-Kupu</Text>
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
                        Hasil Sprint Hari Ini 🔥
                      </Text>
                      <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>50m</Text>
                        <Text style={styles.resultValue}>
                          {toMinuteFromMili(record.fiftyValue)} Menit
                        </Text>
                      </View>
                      <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>100m</Text>
                        <Text style={styles.resultValue}>
                          {toMinuteFromMili(record.hundredValue)} Menit
                        </Text>
                      </View>
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
            style={[styles.button, { backgroundColor: "#2B8C45" }]}
            onPress={() => {
              router.push(`/graphic?userId=${userId}`);
            }}
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

  header: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    color: Colors.light.text,
    fontFamily: Typography.bold,
  },
  subTitle: {
    fontSize: 12,
    fontFamily: Typography.regular,
    color: Colors.light.text,
    marginTop: 2,
  },
  buttonGroup: {
    gap: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontFamily: Typography.bold,
    fontSize: 14,
    paddingBottom: 3,
  },
  backButton: {
    backgroundColor: Colors.light.foreground,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  emptyText: {
    fontSize: 10,
    color: "#999",
    fontFamily: Typography.light,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "space-between",
  },
  programButton: {
    backgroundColor: Colors.light.secondary,
  },
  programButtonText: {
    letterSpacing: 0.5,
  },
  timeBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    gap: 10,
  },
  section: {
    marginTop: 5,
    marginBottom: 5,
  },

  // section program hari ini
  programList: {
    maxHeight: 100,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryColumn: {
    width: "48%",
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 13,
    fontFamily: Typography.bold,
    color: Colors.light.text,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    color: Colors.light.text,
    fontFamily: Typography.bold,
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },

  // best time
  timeItem: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
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
    fontFamily: Typography.regular,
  },

  timeValue: {
    fontSize: 14,
    color: "#000",
    fontFamily: Typography.bold,
    marginTop: 4,
  },

  categorySection: {
    marginBottom: 15,
  },

  // latihan hari ini
  trainingResultContainer: {
    marginBottom: 20,
    // padding: 12,
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
    borderColor: Colors.light.green,
  },

  addRecordText: {
    color: Colors.light.green,
    fontSize: 16,
    fontFamily: Typography.bold,
    paddingBottom: 3,
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
    fontFamily: Typography.medium,
    lineHeight: 25,
  },

  // hasil hari ini
  resultCardV2: {
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  resultV2TextTitle: {
    fontSize: 16,
    fontFamily: Typography.bold,
    color: Colors.light.primary,
    marginBottom: 8,
  },

  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  resultLabel: {
    fontSize: 14,
    fontFamily: Typography.medium,
    color: "#1A237E",
  },

  resultValue: {
    fontSize: 14,
    fontFamily: Typography.semiBold,
    color: Colors.light.primary,
  },
});

export default UserDetail;
