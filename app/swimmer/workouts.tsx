import { useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { useSwimmerContext } from "@/hooks/useSwimmerContext";
import { getRecentWorkouts } from "@/lib/queries/swimmers";
import { ZoneBadge } from "@/features/workout/ZoneBadge";
import { calcZoneDistribution } from "@/lib/utils/zones";
import type { IntensityZone } from "@/constants/zones";

const ZONE_COLORS: Record<string, string> = {
  pk: "#3B82F6", vk: "#22C55E", mk: "#EAB308", mak: "#EF4444",
};

export default function SwimmerWorkoutsScreen() {
  const { swimmerId, ready } = useSwimmerContext();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (!swimmerId) return;
    const { data } = await getRecentWorkouts(swimmerId, 30);
    if (data) setWorkouts(data);
  }

  useEffect(() => { if (ready) load(); }, [ready, swimmerId]);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Harjoitukset</Text>
        <Text style={s.subtitle}>{workouts.length} viimeisintä</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
          />
        }
      >
        {workouts.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🏊</Text>
            <Text style={s.emptyText}>Ei harjoituksia vielä</Text>
          </View>
        ) : (
          workouts.map((w: any, i: number) => {
            const sets = w.workouts?.pool_sets ?? [];
            const dist = calcZoneDistribution(
              sets.map((s: any) => ({ total_m: s.total_m, intensity_zone: s.intensity_zone as IntensityZone }))
            );

            return (
              <View key={i} style={s.card}>
                <View style={s.cardRow}>
                  <Text style={s.dateText}>{w.workouts?.workout_date}</Text>
                  <Text style={s.distText}>
                    {w.actual_pool_m != null ? `${w.actual_pool_m}m` : "—"}
                  </Text>
                </View>

                {dist.total > 0 && (
                  <>
                    <View style={s.zoneBar}>
                      {(["pk", "vk", "mk", "mak"] as IntensityZone[]).map(z => {
                        const pct = dist[z] / dist.total;
                        return pct > 0 ? (
                          <View key={z} style={{ flex: pct, backgroundColor: ZONE_COLORS[z] }} />
                        ) : null;
                      })}
                    </View>
                    <View style={s.zoneLegend}>
                      {(["pk", "vk", "mk", "mak"] as IntensityZone[]).map(z => {
                        if (dist[z] === 0) return null;
                        return (
                          <View key={z} style={s.zoneItem}>
                            <ZoneBadge zone={z} size="sm" />
                            <Text style={s.zoneKm}>
                              {Math.round(dist[z] / 10) / 100}km
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </>
                )}
              </View>
            );
          })
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  empty: { alignItems: "center", paddingVertical: 64 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 15, color: "#94a3b8" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  dateText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  distText: { fontSize: 15, fontWeight: "700", color: "#0EA5E9" },
  zoneBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  zoneLegend: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  zoneItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  zoneKm: { fontSize: 12, color: "#6b7280" },
});
