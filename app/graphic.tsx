import { Colors } from "@/constants/Colors";
import useUsersStore from "@/store/useUsersStore";
import { formatDate, toMinuteFromMili } from "@/utils/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width - 40;

const Graphic = () => {
  const { userId } = useLocalSearchParams();
  const { users, getTrainingRecords } = useUsersStore();
  const router = useRouter();

  const user = useMemo(
    () => users.find((u) => u.id === userId),
    [users, userId]
  );

  const trainingRecords = useMemo(
    () => getTrainingRecords(String(userId)),
    [getTrainingRecords, userId]
  );

  const [selectedGaya, setSelectedGaya] = useState<string>("");

  const allGaya = useMemo(() => {
    const gayaSet = new Set<string>();
    trainingRecords.forEach((record) => {
      record.program.sprint.forEach((s: any) => {
        if (s.gaya) gayaSet.add(s.gaya);
      });
    });
    return Array.from(gayaSet);
  }, [trainingRecords]);

  const filteredRecords = useMemo(() => {
    if (!selectedGaya) return [];
    return trainingRecords.filter((record) =>
      record.program.sprint.some((s: any) => s.gaya === selectedGaya)
    );
  }, [selectedGaya, trainingRecords]);

  console.log({ filteredRecords });

  const labels = useMemo(
    () => filteredRecords.map((record) => formatDate(record.date)),
    [filteredRecords]
  );

  const { invertedFifty, invertedHundred } = useMemo(() => {
    const fifty = filteredRecords.map((record) => record.fiftyValue / 1000);
    const hundred = filteredRecords.map((record) => record.hundredValue / 1000);
    const all = [...fifty, ...hundred];
    const max = Math.max(...all);
    const min = Math.min(...all);

    return {
      invertedFifty: fifty.map((val) => max - val + min),
      invertedHundred: hundred.map((val) => max - val + min),
    };
  }, [filteredRecords]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Progress Latihan {user?.name}</Text>

      {/* Gaya filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allGaya.map((gaya, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.gayaButton,
                selectedGaya === gaya && styles.gayaButtonActive,
              ]}
              onPress={() => setSelectedGaya(gaya)}
            >
              <Text
                style={[
                  styles.gayaButtonText,
                  selectedGaya === gaya && styles.gayaButtonTextActive,
                ]}
              >
                {gaya}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chart */}
      {selectedGaya ? (
        filteredRecords.length > 0 ? (
          <ScrollView horizontal>
            <LineChart
              data={{
                labels,
                datasets: [
                  {
                    data: invertedFifty,
                    color: () => "#2196F3",
                    strokeWidth: 2,
                  },
                  {
                    data: invertedHundred,
                    color: () => "#F44336",
                    strokeWidth: 2,
                  },
                ],
                legend: ["50m", "100m"],
              }}
              width={Math.max(screenWidth, labels.length)}
              height={260}
              yAxisSuffix=" s"
              chartConfig={{
                backgroundColor: Colors.light.background,
                backgroundGradientFrom: Colors.light.background,
                backgroundGradientTo: Colors.light.background,
                decimalPlaces: 2,
                color: () => "#000",
                labelColor: () => "#666",
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#fff",
                },
              }}
              bezier
              style={{
                borderRadius: 16,
                // paddingRight: 40,
              }}
              yAxisInverted={true}
              formatYLabel={(value) => toMinuteFromMili(Number(value) * 1000)}
            />
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>
            Tidak ada data untuk gaya "{selectedGaya}" pada rentang tanggal ini.
          </Text>
        )
      ) : (
        <Text style={styles.selectText}>
          Pilih gaya renang untuk melihat grafiknya.
        </Text>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Kembali</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Graphic;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: Colors.light.text,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  gayaButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  gayaButtonActive: {
    backgroundColor: Colors.light.success,
  },
  gayaButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },
  gayaButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  dateFilter: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    flex: 1,
  },
  dateText: {
    color: "#444",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  noDataText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
    fontSize: 14,
  },
  selectText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
    fontSize: 14,
  },
  backButton: {
    marginTop: 30,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
