import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typhography";
import { useSelectOptions } from "@/hooks/useSelectOptions";
import { TDailyPrograms, TProgramItem } from "@/store/useAgendaStore";
import { TJarak } from "@/type/program";
import { formatCategory } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { FormProgram } from "./FormProgram";

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

  const filledSprintJarak = useMemo(
    () => existingSprintItems?.map((item) => item.jarak) ?? [],
    [existingSprintItems]
  );

  const gayaOptionsUpdated = useMemo(() => {
    return selectedCategory === "main"
      ? [...gayaOptions, { label: "Gaya Ganti", value: "Gaya Ganti" }]
      : gayaOptions;
  }, [selectedCategory, gayaOptions]);

  const availableJarakOptions = useMemo(() => {
    return selectedCategory === "sprint"
      ? jarakOptions.filter(
          (opt) =>
            opt.value !== "200" &&
            !filledSprintJarak.includes(opt.value as TJarak)
        )
      : jarakOptions;
  }, [selectedCategory, jarakOptions, filledSprintJarak]);

  const handleFormSubmit = useCallback(
    (data: FormValues) => {
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
    },
    [selectedCategory, onSubmit, onClose, reset]
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Tambah Program </Text>
          <Text style={styles.subtitle}>
            {selectedDay} - {formatCategory(selectedCategory)}
          </Text>

          {/* Volume */}
          <FormProgram<FormValues>
            name="volume"
            control={control}
            label="Volume"
            items={volumeOptions}
            placeholder="Pilih Volume"
            error={errors.volume?.message}
          />

          {/* Jarak */}
          <FormProgram<FormValues>
            name="jarak"
            control={control}
            label="Jarak"
            items={availableJarakOptions}
            placeholder="Pilih Jarak"
            error={errors.jarak?.message}
          />

          {/* Gaya */}
          <FormProgram<FormValues>
            name="gaya"
            control={control}
            label="Gaya"
            items={gayaOptionsUpdated}
            placeholder="Pilih Gaya"
            error={errors.gaya?.message}
          />

          {/* Alat */}
          <FormProgram<FormValues>
            name="alat"
            control={control}
            label="Alat (Opsional)"
            items={alatOptions}
            placeholder="Pilih Alat"
            error={errors.alat?.message}
          />

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

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit(handleFormSubmit)}
            >
              <Text
                style={{
                  color: "white",
                  fontFamily: Typography.bold,
                  paddingBottom: 3,
                }}
              >
                Simpan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                onClose();
                setError("");
                reset();
              }}
            >
              <Text
                style={{
                  color: "black", // teks hitam
                  fontFamily: Typography.bold,
                  paddingBottom: 3,
                }}
              >
                Batal
              </Text>
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorBannerText: {
    color: "#D32F2F",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.semiBold,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "85%",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    fontFamily: Typography.medium,
    marginBottom: 1,
    textAlign: "center",
    marginVertical: 2,
    // paddingBottom: 5,
  },
  label: {
    fontSize: 14,
    marginBottom: 2,
    fontFamily: Typography.bold,
    marginTop: 12,
  },
  subLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Typography.medium,
  },
  title: {
    fontSize: 16,
    fontFamily: Typography.bold,
    textAlign: "center",
    color: Colors.light.text,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: "column", // vertikal
    gap: 10, // spasi antar tombol
    marginTop: 14,
  },
  cancelButton: {
    backgroundColor: Colors.light.foreground,
    borderRadius: 6,
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 6,
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
  },
});
