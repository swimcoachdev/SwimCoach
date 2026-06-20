import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { tone as toneTokens, radius, space, type Tone } from "@/constants/theme";

interface Props {
  label: string;
  tone?: Tone;
}

/** Small status pill — color comes from the tone token, never a raw hex. */
export function Badge({ label, tone = "default" }: Props) {
  const t = toneTokens[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text variant="label" color={t.fg}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
});
