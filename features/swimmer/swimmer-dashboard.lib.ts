/**
 * View-model for the swimmer's own dashboard. Pure data → view-model + the
 * "recent workouts" shape the screen reads; no react / react-native imports.
 */
import type { IntensityZone } from "@/constants/zones";

export interface RecentWorkoutSet {
  intensity_zone: IntensityZone;
  total_m: number;
}

export interface RecentWorkout {
  actual_pool_m: number | null;
  recorded_at: string;
  workouts: {
    workout_date: string;
    workout_type: string;
    pool_sets: RecentWorkoutSet[] | null;
  } | null;
}

/** Flatten every pool set across recent workouts, for zone-distribution math. */
export function recentSets(workouts: RecentWorkout[]): { total_m: number; intensity_zone: IntensityZone }[] {
  return workouts.flatMap((w) =>
    (w.workouts?.pool_sets ?? []).map((s) => ({ total_m: s.total_m, intensity_zone: s.intensity_zone })),
  );
}

/** Total swum metres / km across recent workouts. */
export function recentVolume(workouts: RecentWorkout[]): { totalM: number; totalKm: number } {
  const totalM = workouts.reduce((acc, w) => acc + (w.actual_pool_m ?? 0), 0);
  return { totalM, totalKm: Math.round(totalM / 100) / 10 };
}
