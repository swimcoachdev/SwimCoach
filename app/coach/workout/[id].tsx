import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WorkoutDetailView } from "@/features/workout/WorkoutDetail";
import { useWorkoutDetail } from "@/lib/queries/workouts";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const workoutQ = useWorkoutDetail(id);

  if (workoutQ.isLoading || !workoutQ.data) {
    return <View style={s.loading}><Text style={s.loadingText}>Ladataan...</Text></View>;
  }

  return <WorkoutDetailView workout={workoutQ.data} onBack={() => router.back()} />;
}

const s = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#94A3B8" },
});
