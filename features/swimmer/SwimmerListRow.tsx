import { View, Text, TouchableOpacity, StyleSheet, type DimensionValue } from "react-native";
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
  const color = pct == null ? "#9CA3AF" : pct >= 80 ? "#22C55E" : pct >= 50 ? "#EAB308" : "#EF4444";
  const bg = avatarColor(swimmer.full_name);

  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.avatar, { backgroundColor: bg }]}>
        <Text style={s.avatarText}>{initials(swimmer.full_name)}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name}>{swimmer.full_name}</Text>
        <View style={s.barTrack}>
          <View style={[s.barFill, { width: `${pct ?? 0}%` as DimensionValue, backgroundColor: color }]} />
        </View>
      </View>
      <View style={s.stats}>
        <Text style={[s.pct, { color }]}>{pct ?? "—"}%</Text>
        <Text style={s.sub}>{km} / {targetKm} km</Text>
      </View>
      <Text style={s.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  avatar: { width: 38, height: 38, borderRadius: 10, alignItems: "center",
    justifyContent: "center", marginRight: 12 },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 14, fontWeight: "600", color: "#0F172A", marginBottom: 6 },
  barTrack: { height: 4, backgroundColor: "#F1F5F9", borderRadius: 2, overflow: "hidden" },
  barFill: { height: 4, borderRadius: 2 },
  stats: { alignItems: "flex-end", marginRight: 8 },
  pct: { fontSize: 14, fontWeight: "700" },
  sub: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  chevron: { color: "#CBD5E1", fontSize: 18 },
});
