import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typhography";
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

  const [selectedPoint, setSelectedPoint] = useState<{
    index: number;
    value: number;
  } | null>(null);

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

  const labels = useMemo(
    () => filteredRecords.map((record) => formatDate(record.date)),
    [filteredRecords]
  );

  const { invertedFifty, invertedHundred, max, min } = useMemo(() => {
    const fifty = filteredRecords.map((record) => record.fiftyValue / 1000);
    const hundred = filteredRecords.map((record) => record.hundredValue / 1000);
    const all = [...fifty, ...hundred];
    const max = Math.max(...all);
    const min = Math.min(...all);

    return {
      invertedFifty: fifty.map((val) => max - val + min),
      invertedHundred: hundred.map((val) => max - val + min),
      max,
      min,
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
      <View style={{ position: "relative" }}>
        {selectedGaya ? (
          filteredRecords.length > 0 ? (
            <ScrollView horizontal>
              <LineChart
                bezier
                height={260}
                yAxisSuffix="m"
                style={{
                  borderRadius: 16,
                  // marginLeft: 40,
                }}
                formatYLabel={(v) => {
                  const actual = max - Number(v) + min;
                  return toMinuteFromMili(actual * 1000);
                }}
                width={Math.max(screenWidth, labels.length)}
                onDataPointClick={({ index, value, dataset }) => {
                  console.log("Point clicked:", { index, value, dataset });
                  setSelectedPoint({ index, value });
                }}
                data={{
                  labels,
                  datasets: [
                    {
                      data: invertedFifty,
                      color: () => Colors.light.primary,
                      strokeWidth: 2,
                    },
                    {
                      data: invertedHundred,
                      color: () => Colors.light.redScodndary,
                      strokeWidth: 2,
                    },
                  ],
                  legend: ["50m", "100m"],
                }}
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
              />
            </ScrollView>
          ) : (
            <Text style={styles.noDataText}>
              Tidak ada data untuk gaya "{selectedGaya}" pada rentang tanggal
              ini.
            </Text>
          )
        ) : (
          <Text style={styles.selectText}>
            Pilih gaya renang untuk melihat grafiknya.
          </Text>
        )}

        {selectedPoint && (
          <View style={styles.selectedInfoCard}>
            <Text style={styles.selectedInfoTitle}>Detail Titik Terpilih</Text>
            <Text style={styles.selectedInfoText}>
              Tanggal: {labels[selectedPoint.index] || "-"}
            </Text>
            <Text style={styles.selectedInfoText}>
              Nilai:{" "}
              {toMinuteFromMili((max - selectedPoint.value + min) * 1000)} menit
            </Text>
          </View>
        )}
      </View>

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
    fontFamily: Typography.bold,
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
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
  },
  gayaButtonActive: {
    backgroundColor: Colors.light.green,
  },
  gayaButtonText: {
    color: "#333",
    fontSize: 14,
    fontFamily: Typography.bold,
    paddingBottom: 3,
  },
  gayaButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
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
    fontFamily: Typography.medium,
    fontSize: 14,
  },
  backButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: Typography.bold,
  },
  selectedInfoCard: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  selectedInfoTitle: {
    fontSize: 16,
    fontFamily: Typography.bold,
    color: "#0D47A1",
    marginBottom: 8,
  },
  selectedInfoText: {
    fontSize: 14,
    fontFamily: Typography.medium,
    color: "#1A237E",
    fontWeight: "500",
  },
});
