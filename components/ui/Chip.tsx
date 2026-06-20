import { TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "./Text";
import { color, radius, space } from "@/constants/theme";

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

/** Pill selector with an active state — filters, segment pickers, suggestions. */
export function Chip({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
      style={[styles.chip, active ? styles.active : null]}
    >
      <Text variant="caption" color={active ? color.onPrimary : color.inkMuted}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface,
  },
  active: { backgroundColor: color.primary, borderColor: color.primary },
});
