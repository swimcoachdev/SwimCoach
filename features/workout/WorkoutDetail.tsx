import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { ZoneBadge } from "@/features/workout/ZoneBadge";
import { ZoneDistributionChart } from "@/components/charts/ZoneDistribution";
import { calcZoneDistribution } from "@/lib/utils/zones";
import { STROKES } from "@/constants/strokes";
import { DRYLAND_CATEGORIES } from "@/types/workout";
import type { WorkoutDetail } from "@/features/workout/workout-detail.lib";

const BRAND = "#0EA5E9";

export function WorkoutDetailView({ workout, onBack }: { workout: WorkoutDetail; onBack: () => void }) {
  const sets = workout.pool_sets ?? [];
  const zoneDist = calcZoneDistribution(sets.map((set) => ({ total_m: set.total_m, intensity_zone: set.intensity_zone })));
  const dryland = workout.dryland_sessions?.[0];
  const attendees = workout.workout_attendance ?? [];

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <View style={s.headerSection}>
        <TouchableOpacity onPress={onBack} style={s.back}>
          <Text style={s.backText}>← Takaisin</Text>
        </TouchableOpacity>
        <Text style={s.date}>{workout.workout_date}</Text>
        <Text style={s.meta}>
          {workout.total_pool_m > 0 ? `${workout.total_pool_m}m uintia` : ""}
          {workout.total_pool_m > 0 && dryland ? " + " : ""}
          {dryland ? `${dryland.duration_min} min ${DRYLAND_CATEGORIES[dryland.category] ?? dryland.category}` : ""}
        </Text>
      </View>

      {sets.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Ohjelma</Text>
          {sets.map((set, i) => (
            <View key={set.id} style={s.setRow}>
              <Text style={s.setNum}>{i + 1}</Text>
              <Text style={s.setMain}>
                {set.repetitions}×{set.distance_m}m{" "}
                <Text style={s.setStroke}>{STROKES[set.stroke as keyof typeof STROKES]?.short ?? ""}</Text>
              </Text>
              <Text style={s.setTotal}>{set.total_m}m</Text>
              <ZoneBadge zone={set.intensity_zone} size="sm" />
            </View>
          ))}
          <Text style={s.totalM}>{workout.total_pool_m}m</Text>
        </View>
      )}

      {sets.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Tehoaluejakauma</Text>
          <ZoneDistributionChart actual={zoneDist} />
        </View>
      )}

      {attendees.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Läsnäolijat ({attendees.length})</Text>
          {attendees.map((a) => (
            <View key={a.id} style={s.attendeeRow}>
              <Text style={s.attendeeName}>{a.swimmers?.full_name}</Text>
              <Text style={s.attendeeM}>{a.actual_pool_m ?? workout.total_pool_m}m</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { paddingBottom: 32 },
  headerSection: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 },
  back: { marginBottom: 12 },
  backText: { color: BRAND, fontSize: 14 },
  date: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  meta: { fontSize: 13, color: "#64748B", marginTop: 2 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginHorizontal: 16,
    marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#0F172A", marginBottom: 12 },
  setRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
  setNum: { width: 20, fontSize: 11, color: "#94A3B8" },
  setMain: { flex: 1, fontSize: 13, fontWeight: "500", color: "#0F172A" },
  setStroke: { color: "#94A3B8", fontWeight: "400" },
  setTotal: { fontSize: 13, color: "#64748B", marginRight: 10 },
  totalM: { fontSize: 14, fontWeight: "700", color: BRAND, textAlign: "right", marginTop: 10 },
  attendeeRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
  attendeeName: { flex: 1, fontSize: 13, color: "#0F172A" },
  attendeeM: { fontSize: 13, color: "#64748B" },
});
