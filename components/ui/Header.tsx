import { type ReactNode } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { Text } from "./Text";
import { color, space } from "@/constants/theme";

interface Props {
  title?: string;
  subtitle?: string;
  /** When set, renders a back chevron that calls this. */
  onBack?: () => void;
  /** Trailing slot (e.g. a logout button or action). */
  right?: ReactNode;
  /** Fill with the surface color + a bottom hairline (a solid app bar). Default true. */
  surface?: boolean;
  /** Extra content rendered below the title row, inside the header block. */
  children?: ReactNode;
}

/** The standard top app bar — owns the safe-area top inset so its fill reaches the notch. */
export function Header({ title, subtitle, onBack, right, surface = true, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[surface ? styles.surface : null, { paddingTop: insets.top + space.md }]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={8} style={styles.back}>
            <ChevronLeft size={24} color={color.ink} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.titleWrap}>
          {title ? <Text variant="title" numberOfLines={1}>{title}</Text> : null}
          {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: color.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    minHeight: 40,
  },
  back: { marginLeft: -space.xs },
  titleWrap: { flex: 1 },
});
