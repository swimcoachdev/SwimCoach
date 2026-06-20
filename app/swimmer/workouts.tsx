import { ScrollView, RefreshControl, StyleSheet } from "react-native";
import { Waves } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { ScreenState } from "@/components/ui/ScreenState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSwimmerContext } from "@/hooks/useSwimmerContext";
import { useRecentWorkouts } from "@/lib/queries/swimmers";
import { SwimmerWorkoutCard } from "@/features/swimmer/SwimmerWorkoutCard";
import { color, space } from "@/constants/theme";

export default function SwimmerWorkoutsScreen() {
  const { swimmerId, ready } = useSwimmerContext();
  const workoutsQ = useRecentWorkouts(swimmerId ?? undefined, 30);
  const workouts = workoutsQ.data ?? [];

  return (
    <Screen>
      <Header title="Harjoitukset" subtitle={`${workouts.length} viimeisintä`} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={workoutsQ.isRefetching}
            onRefresh={() => workoutsQ.refetch()}
            tintColor={color.primary}
          />
        }
      >
        <ScreenState
          query={workoutsQ}
          busy={!ready}
          isEmpty={(data) => data.length === 0}
          empty={<EmptyState icon={Waves} text="Ei harjoituksia vielä" />}
        >
          {(data) => data.map((w, i) => <SwimmerWorkoutCard key={w.recorded_at + i} workout={w} />)}
        </ScreenState>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: space.lg, paddingBottom: space.xxxl, gap: space.md },
});
