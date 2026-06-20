import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useSwimmerContext } from "@/hooks/useSwimmerContext";
import { useYearlyGoal } from "@/lib/queries/goals";
import { targetZones } from "@/features/swimmer/swimmer-detail.lib";
import { msToTimeString } from "@/lib/utils/time";
import { STROKES } from "@/constants/strokes";
import { ZONES, ZONE_ORDER } from "@/constants/zones";

export default function GoalsScreen() {
  const { swimmerId } = useSwimmerContext();
  const year = new Date().getFullYear();
  const goalQ = useYearlyGoal(swimmerId ?? undefined, year);

  if (goalQ.isLoading) return (
    <View style={s.center}>
      <ActivityIndicator color="#0EA5E9" />
    </View>
  );

  const goal = goalQ.data;
  if (!goal) return (
    <View style={s.center}>
      <Text style={s.emptyIcon}>🎯</Text>
      <Text style={s.emptyTitle}>Ei vuositavoitetta</Text>
      <Text style={s.emptyText}>
        Tavoite asetetaan onboarding-vaiheessa tai valmentajan kautta.
      </Text>
    </View>
  );

  const zones = targetZones(goal) ?? { pk: 0, vk: 0, mk: 0, mak: 0 };

  return (
    <ScrollView style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Tavoitteet</Text>
        <Text style={s.subtitle}>Kausi {year}</Text>
      </View>

      <View style={s.content}>
        <View style={s.card}>
          <Text style={s.cardTitle}>Volyymi</Text>
          {[
            { label: "Uintimetrit", value: goal.target_pool_km ? `${goal.target_pool_km} km` : "—" },
            { label: "Kuivaharjoittelu", value: goal.target_dryland_hours ? `${goal.target_dryland_hours} h` : "—" },
            { label: "Harjoituskerrat", value: goal.target_workouts ? `${goal.target_workouts} krt` : "—" },
          ].map((row, i, arr) => (
            <View key={row.label} style={[s.row, i < arr.length - 1 && s.rowBorder]}>
              <Text style={s.rowLabel}>{row.label}</Text>
              <Text style={s.rowValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Tehoaluejakauma</Text>
          <View style={s.zoneBar}>
            {ZONE_ORDER.map((z) =>
              zones[z] > 0 ? <View key={z} style={{ flex: zones[z], backgroundColor: ZONES[z].color }} /> : null,
            )}
          </View>
          {ZONE_ORDER.map((z, i) => (
            <View key={z} style={[s.zoneRow, i < ZONE_ORDER.length - 1 && s.rowBorder]}>
              <View style={[s.zoneDot, { backgroundColor: ZONES[z].color }]} />
              <Text style={s.zoneLabel}>{ZONES[z].label} — {ZONES[z].description}</Text>
              <Text style={[s.zonePct, { color: ZONES[z].color }]}>{zones[z]}%</Text>
            </View>
          ))}
        </View>

        {goal.target_stroke && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Kisatavoite</Text>
            <View style={s.raceBox}>
              <View>
                <Text style={s.raceName}>
                  {goal.target_distance}m {STROKES[goal.target_stroke as keyof typeof STROKES]?.label ?? goal.target_stroke}
                </Text>
                <Text style={s.raceLabel}>Tavoitelaji</Text>
              </View>
              {goal.target_time_ms && (
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.raceTime}>{msToTimeString(goal.target_time_ms)}</Text>
                  <Text style={s.raceLabel}>tavoiteaika</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: "600", color: "#374151", marginBottom: 6 },
  emptyText: { fontSize: 14, color: "#94a3b8", textAlign: "center" },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  content: { paddingHorizontal: 16 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  rowLabel: { fontSize: 14, color: "#6b7280" },
  rowValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  zoneBar: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 14 },
  zoneRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  zoneDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  zoneLabel: { flex: 1, fontSize: 13, color: "#374151" },
  zonePct: { fontSize: 14, fontWeight: "700" },
  raceBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  raceName: { fontSize: 16, fontWeight: "700", color: "#1e40af" },
  raceLabel: { fontSize: 12, color: "#93c5fd", marginTop: 2 },
  raceTime: { fontSize: 22, fontWeight: "800", color: "#1d4ed8" },
});
