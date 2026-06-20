import { type ReactNode } from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Text } from "./Text";
import { color, radius, space } from "@/constants/theme";

type Variant = "primary" | "secondary" | "ghost";

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  /** Optional leading icon (e.g. a lucide element). */
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** The standard button — primary / secondary / ghost, with a pending state. */
export function Button({ label, onPress, variant = "primary", disabled, loading, icon, style }: Props) {
  const blocked = disabled || loading;
  const fg = variant === "primary" ? color.onPrimary : color.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={blocked}
      activeOpacity={0.85}
      style={[styles.btn, styles[variant], blocked ? styles.disabled : null, style]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.inner}>
          {icon}
          <Text variant="bodyStrong" color={fg}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: { flexDirection: "row", alignItems: "center", gap: space.sm },
  primary: { backgroundColor: color.primary },
  secondary: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.border },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.5 },
});
