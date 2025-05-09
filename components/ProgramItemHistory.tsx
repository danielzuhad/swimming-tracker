import { TProgramItem } from "@/store/useAgendaStore";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const ProgramItemRow = React.memo(({ p }: { p: TProgramItem }) => (
  <View style={styles.programRow}>
    <Text style={styles.programText}>
      {`${p.volume} x ${p.jarak}m, ${p.gaya}`}
      {p.alat && `, ${p.alat}`}
      {p.interval && `, Interval ${p.interval}s`}
    </Text>
  </View>
));

const styles = StyleSheet.create({
  programRow: {
    paddingLeft: 8,
    marginBottom: 2,
  },
  programText: {
    fontSize: 13,
    color: "#666666",
  },
});
