import { type ComponentType, type ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { color, space } from "@/constants/theme";

type IconType = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

interface Props {
  /** A lucide icon component, drawn faint above the text. */
  icon?: IconType;
  text: string;
  /** Optional call-to-action below the text. */
  action?: ReactNode;
}

/** Centered empty placeholder — icon + message + optional action. */
export function EmptyState({ icon: Icon, text, action }: Props) {
  return (
    <View style={styles.wrap}>
      {Icon ? <Icon size={40} color={color.inkFaint} strokeWidth={1.5} /> : null}
      <Text variant="body" color={color.inkMuted} style={styles.text}>{text}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 64, gap: space.md },
  text: { textAlign: "center" },
});
