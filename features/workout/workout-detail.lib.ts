/**
 * Shapes the workout-detail screen reads from `getWorkoutWithSets`. Types only
 * (the zone-distribution math lives in `lib/utils/zones`); no react-native here.
 * DB rows are loosely typed upstream, so the consumed shape is declared here.
 */
import type { IntensityZone } from "@/constants/zones";

export interface PoolSet {
  id: string;
  repetitions: number;
  distance_m: number;
  stroke: string | null;
  total_m: number;
  intensity_zone: IntensityZone;
}

export interface DrylandSession {
  duration_min: number;
  category: string;
  description: string | null;
}

export interface WorkoutAttendee {
  id: string;
  actual_pool_m: number | null;
  swimmers?: { full_name: string } | null;
}

export interface WorkoutDetail {
  id: string;
  workout_date: string;
  workout_type: string;
  total_pool_m: number;
  pool_sets: PoolSet[] | null;
  dryland_sessions: DrylandSession[] | null;
  workout_attendance: WorkoutAttendee[] | null;
}
