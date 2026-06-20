import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { ScreenState } from "@/components/ui/ScreenState";
import { WorkoutDetailView } from "@/features/workout/WorkoutDetail";
import { useWorkoutDetail } from "@/lib/queries/workouts";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const workoutQ = useWorkoutDetail(id);

  return (
    <Screen>
      <ScreenState query={workoutQ}>
        {(workout) => <WorkoutDetailView workout={workout} onBack={() => router.back()} />}
      </ScreenState>
    </Screen>
  );
}
