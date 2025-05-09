import { TDailyPrograms, TProgramItem } from "@/store/useAgendaStore";
import { formatCategory, toMinute } from "@/utils/utils";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
      <TouchableOpacity onPress={handleCardPress} style={cardStyle}>
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
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
                {item.alat ? `& ${item.alat}` : ""}{" "}
                {item.interval && toMinute(item.interval)}
              </Text>
              <TouchableOpacity onPress={() => onDelete(index)}>
                <Text style={{ color: "red", marginLeft: 8 }}>Hapus</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </TouchableOpacity>
    );
  }
);

// Styles
const cardStyle = {
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
};
