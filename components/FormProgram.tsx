import { Colors } from "@/constants/Colors";
import { Typography } from "@/constants/Typhography";
import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
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
        <View style={styles.pickerWrapper}>
          <RNPickerSelect
            onValueChange={field.onChange}
            value={field.value}
            items={items}
            placeholder={{ label: placeholder, value: null }}
            style={{
              inputIOS: styles.pickerText,
              inputAndroid: styles.pickerText,
              placeholder: styles.placeholder,
            }}
          />
        </View>
      )}
    />
    {error && <Text style={styles.error}>{error}</Text>}
  </>
);

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: Typography.semiBold,
    marginTop: 8,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
    fontFamily: Typography.regular,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  pickerText: {
    fontSize: 12,
    fontFamily: Typography.regular,
    color: "#000",
  },

  placeholder: {
    fontSize: 12,
    fontFamily: Typography.regular,
    color: "#999",
  },
});
