import { type ReactNode } from "react";
import { View, TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { color, radius, space, shadow } from "@/constants/theme";

interface Props {
  children: ReactNode;
  /** When set, the whole card is pressable. */
  onPress?: () => void;
  /** Drop the interior padding (for cards that manage their own layout). */
  bare?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The standard surface card — border, radius, padding and shadow from tokens. */
export function Card({ children, onPress, bare, style }: Props) {
  const cardStyle = [styles.card, bare ? styles.bare : null, style];
  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.border,
    padding: space.lg,
    ...shadow.card,
  },
  bare: { padding: 0 },
});
