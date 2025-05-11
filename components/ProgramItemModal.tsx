import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typhography";
import { TProgramItem } from "@/store/useAgendaStore";
import { formatCategory, toMinute } from "@/utils/utils";
import React from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProgramItemModalProps {
  visible: boolean;
  category: string | null;
  programs: TProgramItem[];
  onClose: () => void;
}

const ProgramItemModal: React.FC<ProgramItemModalProps> = ({
  visible,
  category,
  programs,
  onClose,
}) => {
  const renderProgramItem = ({ item }: { item: TProgramItem }) => (
    <View style={styles.programItem}>
      <Text style={styles.programMainText}>
        {item.gaya || "Tidak ada gaya"}
      </Text>
      <View style={styles.programDetails}>
        <Text style={styles.programDetailText}>Jarak: {item.jarak || 0} m</Text>
        <Text style={styles.programDetailText}>
          Volume: {item.volume || 0} set
        </Text>
        <Text style={styles.programDetailText}>
          Interval: {item.interval ? ` ${toMinute(item.interval)} menit` : "-"}
        </Text>
        <Text style={styles.programDetailText}>Alat: {item.alat || "-"}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {category ? formatCategory(category) : "Program"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          {programs.length > 0 ? (
            <FlatList
              data={programs}
              renderItem={renderProgramItem}
              keyExtractor={(item, index) => `${category}-${index}`}
              style={styles.programList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.emptyText}>
              Tidak ada program untuk kategori ini
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%", // Batasi tinggi modal
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    color: Colors.light.text,
    fontFamily: Typography.bold,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.light.text,
  },
  programList: {
    flexGrow: 0,
  },
  programItem: {
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  programMainText: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
    fontFamily: Typography.semiBold,
  },
  programDetails: {
    flexDirection: "column",
  },
  programDetailText: {
    fontSize: 12,
    color: "#555",
    lineHeight: 18,
    fontFamily: Typography.medium,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: Typography.light,
    textAlign: "center",
    marginVertical: 20,
  },
});

export default ProgramItemModal;
