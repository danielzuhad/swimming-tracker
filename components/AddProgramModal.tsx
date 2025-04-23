import { useSelectOptions } from "@/hooks/useSelectOptions";
import { TDailyPrograms, TProgramItem } from "@/store/useAgendaStore";
import { TJarak } from "@/type/program";
import { formatCategory } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Toast from "react-native-toast-message";
import { z } from "zod";

const programSchema = z.object({
  volume: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], {
    required_error: "Volume wajib diisi",
  }),
  jarak: z.enum(["50", "100", "200"], {
    required_error: "Jarak wajib diisi",
  }),
  gaya: z.enum(["Dada", "Bebas", "Punggung", "Kupu", "Gaya Ganti"], {
    required_error: "Jarak wajib diisi",
  }),
  alat: z
    .enum([
      "Fins",
      "Paddle",
      "Paddle + Fins",
      "Snorkel",
      "Pelampung Besar",
      "Pelampung Kecil",
    ])
    .optional(),
  intervalMenit: z.string().optional(),
  intervalDetik: z.string().optional(),
});

type FormValues = z.infer<typeof programSchema>;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: TProgramItem) => void;
  selectedDay: string;
  selectedCategory: keyof TDailyPrograms;
  existingSprintItems?: TProgramItem[];
};

export const AddProgramModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  selectedCategory,
  selectedDay,
  existingSprintItems,
}) => {
  const {
    register,
    setValue,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(programSchema),
  });

  const { volumeOptions, jarakOptions, gayaOptions, alatOptions } =
    useSelectOptions();

  const [error, setError] = useState<String>("");

  const filledSprintJarak =
    existingSprintItems?.map((item) => item.jarak) ?? [];

  const gayaOptionsUpdated =
    selectedCategory === "main"
      ? [...gayaOptions, { label: "Gaya Ganti", value: "Gaya Ganti" }]
      : gayaOptions;

  const availableJarakOptions =
    selectedCategory === "sprint"
      ? jarakOptions.filter(
          (opt) =>
            opt.value !== "200" &&
            !filledSprintJarak.includes(opt.value as TJarak)
        )
      : jarakOptions;

  const handleFormSubmit = (data: FormValues) => {
    const totalInterval =
      (parseInt(data.intervalMenit || "0") || 0) * 60 +
      (parseInt(data.intervalDetik || "0") || 0);

    if (selectedCategory === "sprint" && totalInterval === 0) {
      setError("Interval wajib diisi");
      return;
    }

    onSubmit({
      volume: data.volume,
      jarak: data.jarak,
      gaya: data.gaya,
      alat: data.alat || null,
      interval: totalInterval || null,
    });

    setError("");

    Toast.show({
      type: "success",
      text1: "Program ditambahkan",
      position: "bottom",
    });

    reset();

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.subtitle}>
            {selectedDay} - {formatCategory(selectedCategory)}
          </Text>
          <Text style={styles.title}>Tambah Program </Text>

          {/* Volume */}
          <Text style={styles.label}>Volume</Text>
          <Controller
            control={control}
            name="volume"
            render={({ field }) => (
              <RNPickerSelect
                onValueChange={field.onChange}
                value={field.value}
                items={volumeOptions}
                placeholder={{ label: "Pilih Volume", value: null }}
              />
            )}
          />
          {errors.volume && (
            <Text style={styles.errorText}>{errors.volume.message}</Text>
          )}

          {/* Jarak */}
          <Text style={styles.label}>Jarak</Text>
          <Controller
            control={control}
            name="jarak"
            render={({ field }) => (
              <RNPickerSelect
                onValueChange={field.onChange}
                value={field.value}
                items={availableJarakOptions}
                placeholder={{ label: "Pilih Jarak", value: null }}
              />
            )}
          />

          {errors.jarak && (
            <Text style={styles.errorText}>{errors.jarak.message}</Text>
          )}

          {/* Gaya */}
          <Text style={styles.label}>Gaya</Text>
          <Controller
            control={control}
            name="gaya"
            render={({ field }) => (
              <RNPickerSelect
                onValueChange={field.onChange}
                value={field.value}
                items={gayaOptionsUpdated}
                placeholder={{ label: "Pilih Gaya", value: null }}
              />
            )}
          />
          {errors.gaya && (
            <Text style={styles.errorText}>{errors.gaya.message}</Text>
          )}

          {/* Alat */}
          <Text style={styles.label}>Alat (Opsional)</Text>
          <Controller
            control={control}
            name="alat"
            render={({ field }) => (
              <RNPickerSelect
                onValueChange={field.onChange}
                value={field.value}
                items={alatOptions}
                placeholder={{ label: "Pilih Alat", value: null }}
              />
            )}
          />
          {errors.alat && (
            <Text style={styles.errorText}>{errors.alat.message}</Text>
          )}

          {/* Interval */}
          <Text style={styles.label}>Interval</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>Menit</Text>
              <Controller
                control={control}
                name="intervalMenit"
                render={({ field }) => (
                  <TextInput
                    placeholder="Menit"
                    keyboardType="numeric"
                    value={field.value}
                    onChangeText={field.onChange}
                    style={styles.input}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subLabel}>Detik</Text>
              <Controller
                control={control}
                name="intervalDetik"
                render={({ field }) => (
                  <TextInput
                    placeholder="Detik"
                    keyboardType="numeric"
                    value={field.value}
                    onChangeText={field.onChange}
                    style={styles.input}
                  />
                )}
              />
            </View>
          </View>

          {errors?.root?.message && (
            <Text style={styles.errorText}>{errors.root.message}</Text>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                onClose();
                setError("");
                reset();
              }}
            >
              <Text style={{ color: "white" }}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit(handleFormSubmit)}
            >
              <Text style={{ color: "white" }}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  errorBanner: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorBannerText: {
    color: "#D32F2F",
    fontSize: 14,
    lineHeight: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "85%",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
    marginVertical: 5,
    paddingBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    marginTop: 12,
  },
  subLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  errorText: {
    color: "red",
    marginBottom: 4,
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#aaa",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
});
