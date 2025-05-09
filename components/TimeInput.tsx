import { capitalize } from "@/utils/utils";
import React from "react";
import { Controller } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

export const TimeInput = React.memo(
  ({ name, control }: { name: string; control: any }) => (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>{capitalize(name.replace("Style", ""))}</Text>
      <View style={styles.row}>
        {/* Menit */}
        <View style={{ flex: 1, marginRight: 5 }}>
          <Controller
            name={`${name}.minutes`}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Menit"
                  keyboardType="numeric"
                  style={[styles.input, error && styles.inputError]}
                  value={value ?? ""}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </>
            )}
          />
        </View>

        {/* Detik */}
        <View style={{ flex: 1, marginLeft: 5 }}>
          <Controller
            name={`${name}.seconds`}
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Detik"
                  keyboardType="numeric"
                  style={[styles.input, error && styles.inputError]}
                  value={value ?? ""}
                  onChangeText={onChange}
                />
              </>
            )}
          />
        </View>
      </View>
    </View>
  )
);

const styles = StyleSheet.create({
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
