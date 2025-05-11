import { AddProgramModal } from "@/components/AddProgramModal";
import { ProgramCard } from "@/components/ProgramCard";
import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typhography";
import {
  Day,
  TDailyPrograms,
  TProgramItem,
  useAgendaStore,
} from "@/store/useAgendaStore";
import { today } from "@/utils/utils";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<
    keyof TDailyPrograms | null
  >(null);

  const currentDayProgram = useMemo(
    () => programs[selectedDay],
    [programs, selectedDay]
  );

  const sprintPrograms = useMemo(
    () => currentDayProgram?.sprint ?? [],
    [currentDayProgram]
  );

  const isSprintFull = sprintPrograms.length >= 2;

  const handleOpenModal = useCallback((category: keyof TDailyPrograms) => {
    setSelectedCategory(category);
    setModalVisible(true);
  }, []);

  const handleAddProgram = useCallback(
    (item: TProgramItem) => {
      if (selectedCategory) {
        addProgramItem(selectedDay, selectedCategory, item);
      }
    },
    [addProgramItem, selectedCategory, selectedDay]
  );

  const handleRemoveItem = useCallback(
    (category: keyof TDailyPrograms, index: number) => {
      removeProgramItem(selectedDay, category, index);
    },
    [removeProgramItem, selectedDay]
  );

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
              {
                backgroundColor:
                  selectedDay === day
                    ? Colors.light.primary
                    : Colors.light.foreground,
              },
            ]}
          >
            <Text
              style={{
                ...styles.tabText,
                color:
                  selectedDay === day ? Colors.light.white : Colors.light.text,
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
            <ProgramCard
              key={category}
              category={category as keyof TDailyPrograms}
              items={items}
              isSprintFull={isSprintFull}
              onPress={handleOpenModal}
              onDelete={(index) =>
                handleRemoveItem(category as keyof TDailyPrograms, index)
              }
            />
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
    fontFamily: Typography.bold,
    color: Colors.light.text,
  },
  dayTitle: {
    fontSize: 24,
    color: Colors.light.text,
    marginBottom: 12,
    fontFamily: Typography.bold,
  },
});
