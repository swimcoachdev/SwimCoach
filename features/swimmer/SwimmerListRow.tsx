import { View, TouchableOpacity, StyleSheet, type DimensionValue } from "react-native";
import { Text } from "@/components/ui/Text";
import { color, space, radius, shadow } from "@/constants/theme";
import { km as toKm, type SwimmerSummary } from "@/features/swimmer/swimmer-card.lib";
import { avatarColor, initials } from "@/lib/utils/avatar";

interface Props {
  swimmer: SwimmerSummary;
  onPress: () => void;
}

export function SwimmerListRow({ swimmer, onPress }: Props) {
  const km = toKm(swimmer.total_pool_m);
  const targetKm = toKm(swimmer.target_pool_m);
  const pct = targetKm > 0 ? Math.min(Math.round((km / targetKm) * 100), 100) : null;
  const barColor = pct == null ? color.inkFaint : pct >= 80 ? color.good : pct >= 50 ? color.warn : color.risk;
  const bg = avatarColor(swimmer.full_name);

  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.avatar, { backgroundColor: bg }]}>
        <Text variant="caption" color={color.onPrimary} style={s.avatarText}>{initials(swimmer.full_name)}</Text>
      </View>
      <View style={s.info}>
        <Text variant="bodyStrong" style={s.name}>{swimmer.full_name}</Text>
        <View style={s.barTrack}>
          <View style={[s.barFill, { width: `${pct ?? 0}%` as DimensionValue, backgroundColor: barColor }]} />
        </View>
      </View>
      <View style={s.stats}>
        <Text variant="bodyStrong" color={barColor}>{pct ?? "—"}%</Text>
        <Text variant="caption" color={color.inkFaint} style={s.sub}>{km} / {targetKm} km</Text>
      </View>
      <Text variant="body" color={color.inkFaint} style={s.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", backgroundColor: color.surface,
    borderRadius: radius.md + 2, paddingHorizontal: space.md + 2, paddingVertical: space.md, marginBottom: space.sm,
    ...shadow.card },
  avatar: { width: 38, height: 38, borderRadius: radius.sm + 2, alignItems: "center",
    justifyContent: "center", marginRight: space.md },
  avatarText: { fontWeight: "700" },
  info: { flex: 1, marginRight: space.md },
  name: { marginBottom: space.xs + 2 },
  barTrack: { height: 4, backgroundColor: color.border, borderRadius: 2, overflow: "hidden" },
  barFill: { height: 4, borderRadius: 2 },
  stats: { alignItems: "flex-end", marginRight: space.sm },
  sub: { marginTop: 2 },
  chevron: { fontSize: 18 },
});
