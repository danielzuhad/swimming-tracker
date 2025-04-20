import { Colors } from "@/constants/Colors";
import useUsersStore from "@/store/useUsersStore";
import { convertToSeconds } from "@/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
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
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const timeSchema = z
  .object({
    minutes: z.string().optional(),
    seconds: z.string().optional(),
  })
  .refine(
    (data) => {
      const m = parseInt(data.minutes ?? "0");
      const s = parseInt(data.seconds ?? "0");
      return m > 0 || s > 0;
    },
    { message: "Waktu harus diisi minimal menit atau detik." }
  );

const formSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  chestStyle: timeSchema,
  backstrokeStyle: timeSchema,
  butterflyStyle: timeSchema,
  freeStyle: timeSchema,
});

type FormData = z.infer<typeof formSchema>;

const AddUserModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const addUser = useUsersStore((state) => state.addUser);
  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      chestStyle: { minutes: "", seconds: "" },
      backstrokeStyle: { minutes: "", seconds: "" },
      butterflyStyle: { minutes: "", seconds: "" },
      freeStyle: { minutes: "", seconds: "" },
    },
  });

  const onSubmit = (data: FormData) => {
    addUser({
      id: uuidv4(),
      name: data.name,
      chestStyle: convertToSeconds(data.chestStyle),
      backstrokeStyle: convertToSeconds(data.backstrokeStyle),
      butterflyStyle: convertToSeconds(data.butterflyStyle),
      freeStyle: convertToSeconds(data.freeStyle),
    });

    Toast.show({
      type: "success",
      text1: "Murid ditambahkan",
      position: "bottom",
    });
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Tambah Murid</Text>
          <Text style={styles.label}>Nama</Text>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Nama murid"
                  style={[styles.input, error && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />

          {["chestStyle", "backstrokeStyle", "butterflyStyle", "freeStyle"].map(
            (styleKey) => (
              <View key={styleKey} style={{ marginTop: 10 }}>
                <Text style={styles.label}>
                  {styleKey.replace("Style", "").toUpperCase()}
                </Text>
                <View style={styles.row}>
                  <Controller
                    name={`${styleKey}.minutes` as any}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        placeholder="Menit"
                        keyboardType="numeric"
                        style={{
                          backgroundColor: "#f1f1f1",
                          padding: 10,
                          borderRadius: 8,
                          fontSize: 16,
                          flex: 1,
                        }}
                        value={value ?? ""}
                        onChangeText={onChange}
                      />
                    )}
                  />
                  <Controller
                    name={`${styleKey}.seconds` as any}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        placeholder="Detik"
                        keyboardType="numeric"
                        style={{
                          backgroundColor: "#f1f1f1",
                          padding: 10,
                          borderRadius: 8,
                          fontSize: 16,
                          flex: 1,
                        }}
                        value={value ?? ""}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </View>
              </View>
            )
          )}

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.buttonText}>Simpan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#ccc" }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: "#333" }]}>Batal</Text>
            </TouchableOpacity>
          </View>
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
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    //     flex: 1,
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  label: {
    marginBottom: 6,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  buttonGroup: {
    flexDirection: "column",
    alignItems: "stretch", // biar button-nya w-full
    marginTop: 24,
    gap: 10, // spacing antar tombol
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});

export default AddUserModal;
