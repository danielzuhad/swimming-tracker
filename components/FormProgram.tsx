import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { StyleSheet, Text } from "react-native";
import RNPickerSelect from "react-native-picker-select";

type PickerItem = { label: string; value: string };

type FormProgramProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
  items: PickerItem[];
  placeholder: string;
  error?: string;
};

export const FormProgram = <T extends FieldValues>({
  name,
  control,
  label,
  items,
  placeholder,
  error,
}: FormProgramProps<T>) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <RNPickerSelect
          onValueChange={field.onChange}
          value={field.value}
          items={items}
          placeholder={{ label: placeholder, value: null }}
        />
      )}
    />
    {error && <Text style={styles.error}>{error}</Text>}
  </>
);

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    marginTop: 12,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
