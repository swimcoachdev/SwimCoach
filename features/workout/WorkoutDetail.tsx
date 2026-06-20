import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { ZoneBadge } from "@/features/workout/ZoneBadge";
import { ZoneDistributionChart } from "@/components/charts/ZoneDistribution";
import { calcZoneDistribution } from "@/lib/utils/zones";
import { STROKES } from "@/constants/strokes";
import { DRYLAND_CATEGORIES } from "@/types/workout";
import type { WorkoutDetail } from "@/features/workout/workout-detail.lib";
import { color, radius, space, shadow } from "@/constants/theme";

export function WorkoutDetailView({ workout, onBack }: { workout: WorkoutDetail; onBack: () => void }) {
  const sets = workout.pool_sets ?? [];
  const zoneDist = calcZoneDistribution(sets.map((set) => ({ total_m: set.total_m, intensity_zone: set.intensity_zone })));
  const dryland = workout.dryland_sessions?.[0];
  const attendees = workout.workout_attendance ?? [];

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <View style={s.headerSection}>
        <TouchableOpacity onPress={onBack} style={s.back} hitSlop={8}>
          <ChevronLeft size={18} color={color.primary} />
          <Text variant="body" color={color.primary}>Takaisin</Text>
        </TouchableOpacity>
        <Text variant="title">{workout.workout_date}</Text>
        <Text variant="caption" style={s.meta}>
          {workout.total_pool_m > 0 ? `${workout.total_pool_m}m uintia` : ""}
          {workout.total_pool_m > 0 && dryland ? " + " : ""}
          {dryland ? `${dryland.duration_min} min ${DRYLAND_CATEGORIES[dryland.category] ?? dryland.category}` : ""}
        </Text>
      </View>

      {sets.length > 0 && (
        <View style={s.card}>
          <Text variant="heading" style={s.cardTitle}>Ohjelma</Text>
          {sets.map((set, i) => (
            <View key={set.id} style={s.setRow}>
              <Text variant="caption" color={color.inkFaint} style={s.setNum}>{i + 1}</Text>
              <Text variant="bodyStrong" style={s.setMain}>
                {set.repetitions}×{set.distance_m}m{" "}
                <Text variant="body" color={color.inkFaint}>{STROKES[set.stroke as keyof typeof STROKES]?.short ?? ""}</Text>
              </Text>
              <Text variant="body" color={color.inkMuted} style={s.setTotal}>{set.total_m}m</Text>
              <ZoneBadge zone={set.intensity_zone} size="sm" />
            </View>
          ))}
          <Text variant="bodyStrong" color={color.primary} style={s.totalM}>{workout.total_pool_m}m</Text>
        </View>
      )}

      {sets.length > 0 && (
        <View style={s.card}>
          <Text variant="heading" style={s.cardTitle}>Tehoaluejakauma</Text>
          <ZoneDistributionChart actual={zoneDist} />
        </View>
      )}

      {attendees.length > 0 && (
        <View style={s.card}>
          <Text variant="heading" style={s.cardTitle}>Läsnäolijat ({attendees.length})</Text>
          {attendees.map((a) => (
            <View key={a.id} style={s.attendeeRow}>
              <Text variant="body" style={s.attendeeName}>{a.swimmers?.full_name}</Text>
              <Text variant="body" color={color.inkMuted}>{a.actual_pool_m ?? workout.total_pool_m}m</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingBottom: space.xxxl },
  headerSection: { paddingHorizontal: space.lg, paddingTop: space.huge, paddingBottom: space.lg },
  back: { flexDirection: "row", alignItems: "center", marginLeft: -space.xs, marginBottom: space.md },
  meta: { marginTop: 2 },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    marginHorizontal: space.lg,
    marginBottom: space.md,
    ...shadow.card,
  },
  cardTitle: { marginBottom: space.md },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  setNum: { width: 20 },
  setMain: { flex: 1 },
  setTotal: { marginRight: space.sm },
  totalM: { textAlign: "right", marginTop: space.sm },
  attendeeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  attendeeName: { flex: 1 },
});
