import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { color, space, radius, shadow } from "@/constants/theme";
import { ZoneBadge } from "@/features/workout/ZoneBadge";
import { calcZoneDistribution } from "@/lib/utils/zones";
import { ZONES, type IntensityZone } from "@/constants/zones";
import type { RecentWorkout } from "@/features/swimmer/swimmer-dashboard.lib";

export function SwimmerWorkoutCard({ workout }: { workout: RecentWorkout }) {
  const sets = workout.workouts?.pool_sets ?? [];
  const dist = calcZoneDistribution(sets.map((s) => ({ total_m: s.total_m, intensity_zone: s.intensity_zone })));

  return (
    <View style={s.card}>
      <View style={s.cardRow}>
        <Text variant="bodyStrong" color={color.inkMuted}>{workout.workouts?.workout_date}</Text>
        <Text variant="bodyStrong" color={color.primary}>{workout.actual_pool_m != null ? `${workout.actual_pool_m}m` : "—"}</Text>
      </View>

      {dist.total > 0 && (
        <>
          <View style={s.zoneBar}>
            {(["pk", "vk", "mk", "mak"] as IntensityZone[]).map((z) => {
              const pct = dist[z] / dist.total;
              return pct > 0 ? <View key={z} style={{ flex: pct, backgroundColor: ZONES[z].color }} /> : null;
            })}
          </View>
          <View style={s.zoneLegend}>
            {(["pk", "vk", "mk", "mak"] as IntensityZone[]).map((z) => {
              if (dist[z] === 0) return null;
              return (
                <View key={z} style={s.zoneItem}>
                  <ZoneBadge zone={z} size="sm" />
                  <Text variant="caption" color={color.inkMuted}>{Math.round(dist[z] / 10) / 100}km</Text>
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
  card: { backgroundColor: color.surface, borderRadius: radius.lg, padding: space.lg, marginBottom: space.md,
    ...shadow.card },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: space.sm + 2 },
  zoneBar: { flexDirection: "row", height: 8, borderRadius: radius.sm / 2, overflow: "hidden", marginBottom: space.sm + 2 },
  zoneLegend: { flexDirection: "row", gap: space.sm + 2, flexWrap: "wrap" },
  zoneItem: { flexDirection: "row", alignItems: "center", gap: space.xs },
});
