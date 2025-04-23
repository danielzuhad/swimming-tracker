import { AddProgramModal } from "@/components/AddProgramModal";
import { Colors } from "@/constants/Colors";
import {
  Day,
  TDailyPrograms,
  TProgramItem,
  useAgendaStore,
} from "@/store/useAgendaStore";
import { formatCategory, today, toMinute } from "@/utils/utils";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const days: Day[] = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

const Programs = () => {
  const {
    selectedDay,
    setSelectedDay,
    programs,
    removeProgramItem,
    addProgramItem,
  } = useAgendaStore();

  const currentDayProgram = programs[selectedDay];

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<
    keyof TDailyPrograms | null
  >(null);

  const dayPrograms = programs[selectedDay];
  const sprintPrograms = dayPrograms?.sprint ?? [];

  const isSprintFull = sprintPrograms.length >= 2;

  const handleOpenModal = (category: keyof TDailyPrograms) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const handleAddProgram = (item: TProgramItem) => {
    if (selectedCategory) {
      addProgramItem(selectedDay, selectedCategory, item);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab hari */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
      >
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(day)}
            style={[
              styles.tabButton,
              { backgroundColor: selectedDay === day ? "#3498db" : "#eee" },
            ]}
          >
            <Text
              style={{
                ...styles.tabText,
                color: selectedDay === day ? "white" : "#333",
              }}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Program Item List */}
      {currentDayProgram ? (
        <ScrollView style={{ marginBottom: 20, height: "85%" }}>
          <Text style={styles.dayTitle}>
            {selectedDay === today ? `${selectedDay} (Hari ini)` : selectedDay}
          </Text>
          {Object.entries(currentDayProgram).map(([category, items]) => (
            <TouchableOpacity
              key={category}
              onPress={() => {
                if (category === "sprint") {
                  if (!isSprintFull) {
                    handleOpenModal(category as keyof TDailyPrograms);
                  } else {
                    Toast.show({
                      type: "info",
                      text1: "Maksimal 2 program sprint.",
                      position: "bottom",
                    });
                  }
                } else {
                  handleOpenModal(category as keyof TDailyPrograms);
                }
              }}
              style={{
                backgroundColor: "#fff",
                padding: 16,
                borderRadius: 12,
                marginBottom: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 1,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Text
                style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}
              >
                {formatCategory(category)}
              </Text>

              {items.length === 0 ? (
                <Text style={{ color: "#888" }}>Belum ada program</Text>
              ) : (
                items.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      paddingVertical: 8,
                      borderBottomColor: "#ddd",
                      borderBottomWidth: index !== items.length - 1 ? 1 : 0,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ flex: 1 }}>
                      {item.volume}x{item.jarak}m {item.gaya || "-"}{" "}
                      {item.alat
                        ? `${item.alat && "&"} ${item.alat && item.alat}`
                        : ""}{" "}
                      {item.interval && `${toMinute(item.interval)}`}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        removeProgramItem(
                          selectedDay,
                          category as keyof typeof currentDayProgram,
                          index
                        )
                      }
                    >
                      <Text style={{ color: "red", marginLeft: 8 }}>Hapus</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text>Tidak ada program untuk hari ini</Text>
      )}

      <AddProgramModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddProgram}
        selectedDay={selectedDay}
        selectedCategory={selectedCategory as keyof TDailyPrograms}
        existingSprintItems={
          selectedCategory === "sprint" ? sprintPrograms : undefined
        }
      />
    </SafeAreaView>
  );
};

export default Programs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContainer: {
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginRight: 8,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  tabText: {
    fontWeight: "bold",
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
});
