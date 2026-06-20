import { ScrollView, View, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { LENSES, type LensKey } from "@/features/swimmer/swimmer-card.lib";
import { color, space, radius } from "@/constants/theme";

interface Props {
  value: LensKey;
  /** Whether the active lens is sorted against its natural order (second-tap state). */
  reversed: boolean;
  /** Tap a pill to switch lens; tap the active one again to flip its sort direction. */
  onChange: (lens: LensKey) => void;
}

/** The roster lens: pick what to rank + headline the cards by. Presentational. */
export function LensTabs({ value, reversed, onChange }: Props) {
  const Arrow = reversed ? ChevronUp : ChevronDown;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {LENSES.map((l) => {
          const active = value === l.key;
          return (
            <TouchableOpacity
              key={l.key}
              onPress={() => onChange(l.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text variant="caption" color={active ? color.onPrimary : color.inkMuted}>{l.label}</Text>
              {active && <Arrow size={13} color={color.onPrimary} strokeWidth={2.4} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: space.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: color.bg,
  },
  chipActive: { backgroundColor: color.ink },
});
