import type { ComponentType } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { color, fontFamily } from "@/constants/theme";

type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

/** Bottom-nav item: a lucide icon + label, tinted by focus state. No emoji. */
export function TabIcon({ icon: Icon, label, focused }: { icon: IconType; label: string; focused: boolean }) {
  const c = focused ? color.primary : color.inkFaint;
  return (
    <View style={styles.wrap}>
      <Icon size={22} color={c} strokeWidth={focused ? 2.4 : 2} />
      <Text color={c} style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", width: 70 },
  label: { fontFamily: fontFamily.semibold, fontSize: 10, lineHeight: 13, marginTop: 3 },
});
