import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { color, space, radius } from "@/constants/theme";

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
      <Text variant="caption" color={color.inkFaint} style={s.label}>{current + 1}/{total}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: space.xxxl },
  dot: { height: 6, flex: 1, borderRadius: radius.sm / 2 },
  dotDone: { backgroundColor: color.primary },
  dotCurrent: { backgroundColor: color.primary, opacity: 0.4 },
  dotEmpty: { backgroundColor: color.border },
  label: { marginLeft: space.xs },
});
