import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { color, space, radius, shadow } from "@/constants/theme";
import { msToTimeString } from "@/lib/utils/time";
import type { EventGroup } from "@/features/swimmer/swimmer-competitions.lib";

export function SwimmerEventCard({ group }: { group: EventGroup }) {
  const { event, bestMs, chrono, sorted } = group;
  const maxMs = Math.max(...chrono.map((x) => x.result_time_ms));
  const minMs = Math.min(...chrono.map((x) => x.result_time_ms));
  const range = maxMs - minMs || 1;

  return (
    <View style={s.card}>
      <Text variant="heading" style={s.cardTitle}>{event}</Text>

      <View style={s.chartWrap}>
        {chrono.map((r, i) => {
          const barH = Math.max(12, ((maxMs - r.result_time_ms) / range) * 60 + 12);
          const isPR = r.result_time_ms === bestMs;
          return (
            <View key={i} style={s.barWrap}>
              <View style={[s.bar, { height: barH, backgroundColor: isPR ? color.good : color.primary }]} />
              <Text variant="label" color={color.inkFaint} style={s.barDate}>{r.competition_date.slice(5)}</Text>
            </View>
          );
        })}
      </View>

      {sorted.map((r, i) => {
        const isPR = r.result_time_ms === bestMs;
        return (
          <View key={i} style={[s.row, i < sorted.length - 1 && s.rowBorder]}>
            <View style={s.rowLeft}>
              <Text variant="caption" color={color.inkFaint} style={s.rowDate}>{r.competition_date}</Text>
              <Text variant="caption" color={color.inkMuted} numberOfLines={1}>{r.competition_name}</Text>
            </View>
            <View style={s.rowRight}>
              <Text variant="bodyStrong" color={isPR ? color.good : color.inkMuted}>{msToTimeString(r.result_time_ms)}</Text>
              {isPR && <Text variant="label" color={color.onPrimary} style={s.prBadge}>PR</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: color.surface, borderRadius: radius.lg, padding: space.lg, marginBottom: space.lg,
    ...shadow.card },
  cardTitle: { marginBottom: space.md },
  chartWrap: { flexDirection: "row", alignItems: "flex-end", height: 80, gap: space.xs + 2, marginBottom: space.md + 2, paddingHorizontal: space.xs },
  barWrap: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: radius.sm / 2 },
  barDate: { marginTop: 3 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: space.sm + 2 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  rowLeft: { flex: 1, marginRight: space.sm },
  rowDate: {},
  rowRight: { alignItems: "flex-end" },
  prBadge: { backgroundColor: color.warn,
    paddingHorizontal: space.xs + 1, paddingVertical: 1, borderRadius: radius.sm / 2, marginTop: 2, overflow: "hidden" },
});
