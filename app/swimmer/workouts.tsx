import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { useSwimmerContext } from "@/hooks/useSwimmerContext";
import { useRecentWorkouts } from "@/lib/queries/swimmers";
import { SwimmerWorkoutCard } from "@/features/swimmer/SwimmerWorkoutCard";

export default function SwimmerWorkoutsScreen() {
  const { swimmerId } = useSwimmerContext();
  const workoutsQ = useRecentWorkouts(swimmerId ?? undefined, 30);
  const workouts = workoutsQ.data ?? [];

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Harjoitukset</Text>
        <Text style={s.subtitle}>{workouts.length} viimeisintä</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={workoutsQ.isRefetching} onRefresh={() => workoutsQ.refetch()} />}
      >
        {workouts.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🏊</Text>
            <Text style={s.emptyText}>Ei harjoituksia vielä</Text>
          </View>
        ) : (
          workouts.map((w, i) => <SwimmerWorkoutCard key={w.recorded_at + i} workout={w} />)
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#ffffff", paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  empty: { alignItems: "center", paddingVertical: 64 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 15, color: "#94a3b8" },
});
