import { View, Text, StyleSheet } from "react-native";

interface Props {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: Props) {
  return (
    <View style={s.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            s.dot,
            i < current
              ? s.dotDone
              : i === current
              ? s.dotCurrent
              : s.dotEmpty,
          ]}
        />
      ))}
      <Text style={s.label}>{current + 1}/{total}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 32 },
  dot: { height: 6, flex: 1, borderRadius: 3 },
  dotDone: { backgroundColor: "#0EA5E9" },
  dotCurrent: { backgroundColor: "#0EA5E9", opacity: 0.4 },
  dotEmpty: { backgroundColor: "#E5E7EB" },
  label: { fontSize: 12, color: "#9CA3AF", marginLeft: 4 },
});
