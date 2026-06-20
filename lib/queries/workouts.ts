import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { swimmerKeys } from "@/lib/queries/swimmers";
import type { WorkoutDetail } from "@/features/workout/workout-detail.lib";

export const workoutKeys = {
  all: ["workouts"] as const,
  detail: (workoutId: string) => [...workoutKeys.all, "detail", workoutId] as const,
};

/** One workout with its sets, dryland and attendance. */
export function useWorkoutDetail(workoutId: string | undefined) {
  return useQuery({
    queryKey: workoutKeys.detail(workoutId ?? ""),
    enabled: !!workoutId,
    queryFn: async () => {
      const { data, error } = await getWorkoutWithSets(workoutId!);
      if (error) throw error;
      return data as WorkoutDetail;
    },
  });
}

export interface SaveWorkoutInput {
  workout: {
    club_id: string;
    coach_id?: string;
    group_id?: string;
    workout_date: string;
    workout_type: "uinti" | "kuiva" | "yhdistelma";
    title?: string;
  };
  sets: Array<{
    set_order: number;
    repetitions: number;
    distance_m: number;
    stroke?: string;
    intensity_zone: string;
    description?: string;
  }>;
  dryland?: { duration_min: number; category: string; description?: string };
  attendance: Array<{ swimmer_id: string; actual_pool_m: number }>;
}

/** Create a workout and all its child rows (sets, dryland, attendance) together. */
export async function saveWorkout(input: SaveWorkoutInput) {
  const { data: workout, error } = await createWorkout(input.workout);
  if (error || !workout) throw error ?? new Error("Harjoituksen luonti epäonnistui.");
  const workout_id = workout.id;

  if (input.sets.length > 0) {
    const { error: setsErr } = await addPoolSets(input.sets.map((s) => ({ workout_id, ...s })));
    if (setsErr) throw setsErr;
  }
  if (input.dryland) {
    const { error: dErr } = await addDrylandSession({ workout_id, ...input.dryland });
    if (dErr) throw dErr;
  }
  if (input.attendance.length > 0) {
    const { error: aErr } = await addAttendance(input.attendance.map((a) => ({ workout_id, ...a })));
    if (aErr) throw aErr;
  }
  return workout as { id: string };
}

export function useSaveWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveWorkout,
    // A new workout's attendance feeds the season summary.
    onSuccess: () => qc.invalidateQueries({ queryKey: swimmerKeys.all }),
  });
}

export async function getWorkoutWithSets(workoutId: string) {
  return supabase
    .from("workouts")
    .select(`
      *,
      pool_sets(*),
      dryland_sessions(*),
      workout_attendance(*, swimmers(full_name))
    `)
    .eq("id", workoutId)
    .single();
}

export async function createWorkout(data: {
  club_id: string;
  coach_id?: string;
  group_id?: string;
  workout_date: string;
  workout_type: "uinti" | "kuiva" | "yhdistelma";
  title?: string;
}) {
  return supabase.from("workouts").insert(data).select().single();
}

export async function addPoolSets(sets: Array<{
  workout_id: string;
  set_order: number;
  repetitions: number;
  distance_m: number;
  stroke?: string;
  intensity_zone: string;
  description?: string;
}>) {
  return supabase.from("pool_sets").insert(sets).select();
}

export async function getGroupWorkouts(clubId: string, groupId?: string, limit = 20) {
  let query = supabase
    .from("workouts")
    .select("*, pool_sets(intensity_zone, total_m)")
    .eq("club_id", clubId)
    .order("workout_date", { ascending: false })
    .limit(limit);
  if (groupId) query = query.eq("group_id", groupId);
  return query;
}

export async function addDrylandSession(s: {
  workout_id: string;
  duration_min: number;
  category: string;
  description?: string;
}) {
  return supabase.from("dryland_sessions").insert(s);
}

export async function addAttendance(
  rows: Array<{ workout_id: string; swimmer_id: string; actual_pool_m: number }>,
) {
  return supabase.from("workout_attendance").insert(rows);
}
