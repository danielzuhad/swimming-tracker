import { TDailyPrograms } from "@/store/useAgendaStore";
import useUsersStore from "@/store/useUsersStore";
import { formatDate, toMinuteFromMili } from "@/utils/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define keys for program sections
type Section = keyof TDailyPrograms;
const sections: Section[] = ["warming", "main", "sprint", "down"];

const History = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { getTrainingRecords, users } = useUsersStore();
  const records = getTrainingRecords(String(userId)) || [];
  const user = users.find((u) => u.id === userId);

  const [dateFilter, setDateFilter] = useState<string>("");
  const [maxFifty, setMaxFifty] = useState<string>("");
  const [maxHundred, setMaxHundred] = useState<string>("");
  // Default to newest first (descending)
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (dateFilter && r.date !== dateFilter) return false;
        if (maxFifty && r.fiftyValue > Number(maxFifty)) return false;
        if (maxHundred && r.hundredValue > Number(maxHundred)) return false;
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortAsc ? timeA - timeB : timeB - timeA;
      });
  }, [records, dateFilter, maxFifty, maxHundred, sortAsc]);

  const renderItem = ({ item }: { item: (typeof records)[0] }) => (
    <View style={styles.card}>
      <Text style={styles.cardDate}>{formatDate(item.date)}</Text>

      {/* Best Time Badges */}
      <View style={styles.bestTimesContainer}>
        <View style={styles.bestTimeBadge}>
          <Text style={styles.bestTimeLabel}>50m</Text>
          <Text style={styles.bestTimeValue}>
            {toMinuteFromMili(item.fiftyValue)} Detik
          </Text>
        </View>
        <View style={styles.bestTimeBadge}>
          <Text style={styles.bestTimeLabel}>100m</Text>
          <Text style={styles.bestTimeValue}>
            {toMinuteFromMili(item.hundredValue)} Detik
          </Text>
        </View>
      </View>

      {/* Program Details */}
      {sections.map((section) => (
        <View key={section} style={styles.programSection}>
          <Text style={styles.sectionTitle}>
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </Text>
          {item.program[section].map((p, idx) => (
            <View key={idx} style={styles.programRow}>
              <Text style={styles.programText}>
                {`${p.volume} x ${p.jarak}m, ${p.gaya}`}
                {p.alat && `, ${p.alat}`}
                {p.interval && `, Interval ${p.interval}s`}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Page Title */}
      <Text style={styles.title}>Riwayat Latihan {user?.name || ""}</Text>

      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={dateFilter}
          onChangeText={setDateFilter}
        />
        {/* <TextInput
          style={styles.input}
          placeholder="Max 50m time"
          keyboardType="numeric"
          value={maxFifty}
          onChangeText={setMaxFifty}
        />
        <TextInput
          style={styles.input}
          placeholder="Max 100m time"
          keyboardType="numeric"
          value={maxHundred}
          onChangeText={setMaxHundred}
        /> */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortAsc((prev) => !prev)}
        >
          <Text style={styles.sortButtonText}>
            {sortAsc ? "Tanggal Paling Awal ↑" : "Tanggal Terbaru ↓"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No records found.</Text>
        }
      />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Kembali</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 16,
  },
  filters: {
    marginVertical: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sortButton: {
    alignSelf: "flex-start",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  sortButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 100, // space for back button
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  cardDate: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333333",
  },
  bestTimesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  bestTimeBadge: {
    flex: 1,
    backgroundColor: "#E6F0FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 4,
  },
  bestTimeLabel: {
    fontSize: 12,
    color: "#005FCC",
    marginBottom: 4,
  },
  bestTimeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#002A66",
  },
  programSection: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#444444",
  },
  programRow: {
    paddingLeft: 8,
    marginBottom: 2,
  },
  programText: {
    fontSize: 13,
    color: "#666666",
  },
  emptyText: {
    textAlign: "center",
    color: "#999999",
    marginTop: 20,
  },
  backButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
