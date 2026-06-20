import { View, Text, StyleSheet } from "react-native";
import { ZONES, type IntensityZone } from "@/constants/zones";

interface Props { zone: IntensityZone; size?: "sm" | "md"; }

export function ZoneBadge({ zone, size = "md" }: Props) {
  const { label, color } = ZONES[zone];
  return (
    <View style={[
      styles.badge,
      size === "sm" ? styles.sm : styles.md,
      { backgroundColor: color + "22", borderColor: color },
    ]}>
      <Text style={[styles.text, size === "sm" ? styles.textSm : styles.textMd, { color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  md: { paddingHorizontal: 12, paddingVertical: 4 },
  text: { fontWeight: "700" },
  textSm: { fontSize: 11 },
  textMd: { fontSize: 13 },
});
