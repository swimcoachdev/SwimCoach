import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { type AttentionItem, type AttentionReason } from "@/features/swimmer/roster-attention.lib";
import { color, space, radius, shadow, type Tone } from "@/constants/theme";

interface Props {
  items: AttentionItem[];
  onOpenSwimmer: (id: string) => void;
  /** How many rows to show before collapsing into a "+N muuta" line. */
  cap?: number;
}

const REASON_TONE: Record<AttentionReason, Tone> = { behind: "risk", teho: "warn" };

/** The Koti triage block: who needs the coach's eye today, tap to open. Presentational. */
export function AttentionStrip({ items, onOpenSwimmer, cap = 6 }: Props) {
  if (items.length === 0) {
    return (
      <View style={[s.card, s.calm]}>
        <Check size={18} color={color.good} strokeWidth={2.5} />
        <Text variant="bodyStrong" color={color.good}>Kaikki aikataulussa</Text>
      </View>
    );
  }

  const shown = items.slice(0, cap);
  const rest = items.length - shown.length;

  return (
    <View style={s.card}>
      <Text variant="label" style={s.title}>Vaatii huomiota · {items.length}</Text>
      {shown.map((it, i) => (
        <TouchableOpacity
          key={it.swimmer_id}
          style={[s.row, i < shown.length - 1 && s.rowBorder]}
          onPress={() => onOpenSwimmer(it.swimmer_id)}
          activeOpacity={0.7}
        >
          <View style={[s.dot, { backgroundColor: color[it.reason === "behind" ? "risk" : "warn"] }]} />
          <View style={s.info}>
            <Text variant="bodyStrong" numberOfLines={1}>{it.full_name}</Text>
            <Text variant="caption" color={color.inkMuted}>{it.detail}</Text>
          </View>
          <Badge label={it.label} tone={REASON_TONE[it.reason]} />
          <Text variant="body" color={color.inkFaint} style={s.chevron}>›</Text>
        </TouchableOpacity>
      ))}
      {rest > 0 && <Text variant="caption" color={color.inkFaint} style={s.more}>+{rest} muuta</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.border,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    marginBottom: space.md,
    ...shadow.card,
  },
  calm: { flexDirection: "row", alignItems: "center", gap: space.sm, justifyContent: "center" },
  title: { marginBottom: space.xs },
  row: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingVertical: space.sm },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  dot: { width: 8, height: 8, borderRadius: 4 },
  info: { flex: 1 },
  chevron: { fontSize: 18 },
  more: { marginTop: space.sm },
});
