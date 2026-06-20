import { View, Text, StyleSheet } from "react-native";
import { ZoneBadge } from "@/features/workout/ZoneBadge";
import { calcZoneDistribution } from "@/lib/utils/zones";
import type { IntensityZone } from "@/constants/zones";
import type { RecentWorkout } from "@/features/swimmer/swimmer-dashboard.lib";

const ZONE_COLORS: Record<IntensityZone, string> = {
  pk: "#3B82F6", vk: "#22C55E", mk: "#EAB308", mak: "#EF4444",
};

export function SwimmerWorkoutCard({ workout }: { workout: RecentWorkout }) {
  const sets = workout.workouts?.pool_sets ?? [];
  const dist = calcZoneDistribution(sets.map((s) => ({ total_m: s.total_m, intensity_zone: s.intensity_zone })));

  return (
    <View style={s.card}>
      <View style={s.cardRow}>
        <Text style={s.dateText}>{workout.workouts?.workout_date}</Text>
        <Text style={s.distText}>{workout.actual_pool_m != null ? `${workout.actual_pool_m}m` : "—"}</Text>
      </View>

      {dist.total > 0 && (
        <>
          <View style={s.zoneBar}>
            {(["pk", "vk", "mk", "mak"] as IntensityZone[]).map((z) => {
              const pct = dist[z] / dist.total;
              return pct > 0 ? <View key={z} style={{ flex: pct, backgroundColor: ZONE_COLORS[z] }} /> : null;
            })}
          </View>
          <View style={s.zoneLegend}>
            {(["pk", "vk", "mk", "mak"] as IntensityZone[]).map((z) => {
              if (dist[z] === 0) return null;
              return (
                <View key={z} style={s.zoneItem}>
                  <ZoneBadge zone={z} size="sm" />
                  <Text style={s.zoneKm}>{Math.round(dist[z] / 10) / 100}km</Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  dateText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  distText: { fontSize: 15, fontWeight: "700", color: "#0EA5E9" },
  zoneBar: { flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 10 },
  zoneLegend: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  zoneItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  zoneKm: { fontSize: 12, color: "#6b7280" },
});
