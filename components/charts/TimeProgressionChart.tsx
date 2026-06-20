import { View, Text, StyleSheet } from "react-native";
import { msToTimeString, improvementPct } from "@/lib/utils/time";

interface DataPoint {
  date?: string;
  competition_date?: string;
  result_time_ms: number;
  competition_name: string;
  is_personal_best?: boolean;
}

interface Props {
  data: DataPoint[];
  baseline_ms?: number;
  label?: string;
}

export function TimeProgressionChart({ data, baseline_ms, label }: Props) {
  if (data.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>Ei kisatuloksia vielä</Text>
      </View>
    );
  }

  const times = data.map(d => d.result_time_ms);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times, baseline_ms ?? 0);
  const range = maxTime - minTime || 1;
  const chartH = 80;

  return (
    <View>
      <Text style={s.chartLabel}>{label}</Text>

      <View style={{ height: chartH + 24, marginBottom: 8 }}>
        <View style={[s.barsRow, { height: chartH }]}>
          {data.map((d, i) => {
            const barH = Math.max(8, ((maxTime - d.result_time_ms) / range) * chartH);
            const isPR = d.result_time_ms === minTime;
            return (
              <View key={i} style={s.barCol}>
                <View
                  style={[
                    s.bar,
                    { height: barH, backgroundColor: isPR ? "#22C55E" : "#0EA5E9", opacity: 0.8 },
                  ]}
                />
              </View>
            );
          })}
        </View>
        <View style={s.axisRow}>
          {data.map((d, i) => (
            <Text key={i} style={s.axisLabel} numberOfLines={1}>
              {(d.competition_date || d.date || "").slice(5)}
            </Text>
          ))}
        </View>
      </View>

      {data.slice().reverse().slice(0, 5).map((d, i) => {
        const isPR = d.result_time_ms === minTime;
        const vsBaseline = baseline_ms ? improvementPct(baseline_ms, d.result_time_ms) : null;
        return (
          <View key={i} style={s.row}>
            <Text style={s.dateText}>{d.competition_date || d.date}</Text>
            <Text style={s.nameText} numberOfLines={1}>{d.competition_name}</Text>
            <Text style={[s.timeText, isPR && s.prTime]}>
              {msToTimeString(d.result_time_ms)}
            </Text>
            {isPR && <Text style={s.prBadge}>PR</Text>}
            {vsBaseline != null && vsBaseline > 0 && (
              <Text style={s.vsText}>−{vsBaseline}%</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  empty: { paddingVertical: 24, alignItems: "center" },
  emptyText: { color: "#D1D5DB", fontSize: 14 },
  chartLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 12 },
  barsRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  barCol: { flex: 1, alignItems: "center" },
  bar: { width: "100%", borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  axisRow: { flexDirection: "row", gap: 4, marginTop: 4 },
  axisLabel: { flex: 1, textAlign: "center", fontSize: 8, color: "#D1D5DB" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F9FAFB" },
  dateText: { fontSize: 12, color: "#9CA3AF", width: 80 },
  nameText: { flex: 1, fontSize: 12, color: "#6B7280", marginHorizontal: 8 },
  timeText: { fontWeight: "700", fontSize: 14, color: "#374151" },
  prTime: { color: "#22C55E" },
  prBadge: { fontSize: 12, color: "#86EFAC", marginLeft: 4 },
  vsText: { fontSize: 12, color: "#22C55E", marginLeft: 8 },
});
