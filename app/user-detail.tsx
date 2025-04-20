import { Colors } from "@/constants/Colors";
import useUsersStore from "@/store/useUsersStore";
import { toMinute } from "@/utils/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserDetail = () => {
  const { userId } = useLocalSearchParams();
  const users = useUsersStore((state) => state.users);
  const router = useRouter();

  const user = users.find((u) => u.id === userId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{user?.name}</Text>
        <Text style={styles.subTitle}>Best Time Renang</Text>
      </View>

      <View style={styles.timeBox}>
        <Text style={styles.timeLabel}>🏊‍♂️ Gaya Dada</Text>
        <Text style={styles.timeValue}>
          {user?.chestStyle ? toMinute(user?.chestStyle) : "-"}
        </Text>

        <Text style={styles.timeLabel}>🏊‍♂️ Gaya Bebas</Text>
        <Text style={styles.timeValue}>
          {user?.freeStyle ? toMinute(user?.freeStyle) : "-"}
        </Text>

        <Text style={styles.timeLabel}>🏊‍♂️ Gaya Punggung</Text>
        <Text style={styles.timeValue}>
          {user?.backstrokeStyle ? toMinute(user?.backstrokeStyle) : "-"}
        </Text>

        <Text style={styles.timeLabel}>🏊‍♂️ Gaya Kupu-Kupu</Text>
        <Text style={styles.timeValue}>
          {user?.butterflyStyle ? toMinute(user?.butterflyStyle) : "-"}
        </Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>📋 Lihat Latihan Sebelumnya</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#34a853" }]}
          onPress={() => {}}
        >
          <Text style={styles.buttonText}>📈 Lihat Grafik</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  subTitle: {
    fontSize: 18,
    color: Colors.light.textSecondary || "#6e6e6e",
    marginTop: 4,
  },
  timeBox: {
    backgroundColor: "#f1f1f1",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  timeLabel: {
    fontSize: 16,
    color: "#333",
    marginTop: 8,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  buttonGroup: {
    gap: 16,
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
});

export default UserDetail;
