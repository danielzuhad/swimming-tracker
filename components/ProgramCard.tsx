import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typhography";
import { TDailyPrograms, TProgramItem } from "@/store/useAgendaStore";
import { formatCategory, toMinute } from "@/utils/utils";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type ProgramCardProps = {
  category: keyof TDailyPrograms;
  items: TProgramItem[];
  isSprintFull?: boolean;
  onPress: (category: keyof TDailyPrograms) => void;
  onDelete: (index: number) => void;
};

export const ProgramCard = React.memo(
  ({
    category,
    items,
    isSprintFull = false,
    onPress,
    onDelete,
  }: ProgramCardProps) => {
    const handleCardPress = () => {
      if (category === "sprint" && isSprintFull) {
        Toast.show({
          type: "info",
          text1: "Maksimal 2 program sprint.",
          position: "bottom",
        });
        return;
      }
      onPress(category);
    };

    return (
      <TouchableOpacity onPress={handleCardPress} style={styles.card}>
        <Text style={styles.categoryTitle}>{formatCategory(category)}</Text>

        {items.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada program</Text>
        ) : (
          items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              {/* <View style={styles.bullet} /> */}
              <Text style={styles.itemText}>
                {item.volume} x {item.jarak}m,{" "}
                <Text style={styles.gayaText}>{item.gaya || "-"}</Text>
                {item.alat ? ` & ${item.alat}` : ""}
                {item.interval ? ` ( ${toMinute(item.interval)} )` : ""}
              </Text>

              <TouchableOpacity onPress={() => onDelete(index)}>
                <Text style={styles.deleteText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
  },
  categoryTitle: {
    fontFamily: Typography.bold,
    fontSize: 16,
    marginBottom: 2,
    color: Colors.light.text,
  },
  emptyText: {
    color: Colors.light.grey,
    fontFamily: Typography.light,
    fontSize: 14,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  itemText: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  deleteText: {
    fontSize: 14,
    color: Colors.light.redScodndary,
    fontWeight: "600",
    marginLeft: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#c2c2c2",
    marginRight: 8,
    marginTop: 2,
  },
  gayaText: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: "#333",
  },
});
