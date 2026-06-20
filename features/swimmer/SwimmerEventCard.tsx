import { View, Text, StyleSheet } from "react-native";
import { msToTimeString } from "@/lib/utils/time";
import type { EventGroup } from "@/features/swimmer/swimmer-competitions.lib";

export function SwimmerEventCard({ group }: { group: EventGroup }) {
  const { event, bestMs, chrono, sorted } = group;
  const maxMs = Math.max(...chrono.map((x) => x.result_time_ms));
  const minMs = Math.min(...chrono.map((x) => x.result_time_ms));
  const range = maxMs - minMs || 1;

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{event}</Text>

      <View style={s.chartWrap}>
        {chrono.map((r, i) => {
          const barH = Math.max(12, ((maxMs - r.result_time_ms) / range) * 60 + 12);
          const isPR = r.result_time_ms === bestMs;
          return (
            <View key={i} style={s.barWrap}>
              <View style={[s.bar, { height: barH, backgroundColor: isPR ? "#22C55E" : "#0EA5E9" }]} />
              <Text style={s.barDate}>{r.competition_date.slice(5)}</Text>
            </View>
          );
        })}
      </View>

      {sorted.map((r, i) => {
        const isPR = r.result_time_ms === bestMs;
        return (
          <View key={i} style={[s.row, i < sorted.length - 1 && s.rowBorder]}>
            <View style={s.rowLeft}>
              <Text style={s.rowDate}>{r.competition_date}</Text>
              <Text style={s.rowComp} numberOfLines={1}>{r.competition_name}</Text>
            </View>
            <View style={s.rowRight}>
              <Text style={[s.rowTime, isPR && s.rowTimePR]}>{msToTimeString(r.result_time_ms)}</Text>
              {isPR && <Text style={s.prBadge}>PR</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
  chartWrap: { flexDirection: "row", alignItems: "flex-end", height: 80, gap: 6, marginBottom: 14, paddingHorizontal: 4 },
  barWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 4 },
  barDate: { fontSize: 8, color: "#94a3b8", marginTop: 3 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  rowLeft: { flex: 1, marginRight: 8 },
  rowDate: { fontSize: 12, color: "#94a3b8" },
  rowComp: { fontSize: 13, color: "#374151", marginTop: 1 },
  rowRight: { alignItems: "flex-end" },
  rowTime: { fontSize: 16, fontWeight: "700", color: "#374151" },
  rowTimePR: { color: "#22C55E" },
  prBadge: { fontSize: 10, fontWeight: "700", color: "#ffffff", backgroundColor: "#f59e0b",
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, marginTop: 2, overflow: "hidden" },
});
