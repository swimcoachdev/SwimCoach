import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useRealtimeInvalidation } from "@/lib/realtime/useRealtimeInvalidation";
import type { SwimmerSummary } from "@/features/swimmer/swimmer-card.lib";
import type { ProgressionRow, SwimmerProfile } from "@/features/swimmer/swimmer-detail.lib";
import type { RecentWorkout } from "@/features/swimmer/swimmer-dashboard.lib";

/** Query-key factory — the single source of truth for invalidation. */
export const swimmerKeys = {
  all: ["swimmers"] as const,
  seasonSummary: (clubId: string, year: number) =>
    [...swimmerKeys.all, "season-summary", clubId, year] as const,
  profile: (swimmerId: string) => [...swimmerKeys.all, "profile", swimmerId] as const,
  progression: (swimmerId: string) => [...swimmerKeys.all, "progression", swimmerId] as const,
  seasonDetail: (swimmerId: string, year: number) =>
    [...swimmerKeys.all, "season-detail", swimmerId, year] as const,
  recentWorkouts: (swimmerId: string, limit: number) =>
    [...swimmerKeys.all, "recent-workouts", swimmerId, limit] as const,
};

/**
 * Coach roster: every swimmer's season summary for the club, kept live. A logged
 * attendance changes the summary, so the hook self-subscribes to
 * `workout_attendance` and invalidates — the screen never owns a realtime channel.
 */
export function useSeasonSummary(clubId: string | undefined, year: number) {
  useRealtimeInvalidation(
    "workout_attendance",
    clubId ? swimmerKeys.seasonSummary(clubId, year) : null,
  );
  return useQuery({
    queryKey: swimmerKeys.seasonSummary(clubId ?? "", year),
    enabled: !!clubId,
    queryFn: async () => {
      const { data, error } = await getSwimmerSeasonSummary(clubId!, year);
      if (error) throw error;
      // `swimmer_season_summary` is a view; generated types are still stubs
      // (Record<string, unknown>), so assert the domain shape at this boundary.
      return (data ?? []) as SwimmerSummary[];
    },
  });
}

export async function getSwimmerSeasonSummary(clubId: string, year?: number) {
  const season = year ?? new Date().getFullYear();
  return supabase
    .from("swimmer_season_summary")
    .select("*")
    .eq("club_id", clubId)
    .eq("season_year", season);
}

/** A swimmer's full profile (goals + PRs) for the detail screen. */
export function useSwimmerProfile(swimmerId: string | undefined) {
  return useQuery({
    queryKey: swimmerKeys.profile(swimmerId ?? ""),
    enabled: !!swimmerId,
    queryFn: async () => {
      const { data, error } = await getSwimmerProfile(swimmerId!);
      if (error) throw error;
      return data as SwimmerProfile;
    },
  });
}

/** A swimmer's competition time progression, chronological. */
export function useTimeProgression(swimmerId: string | undefined) {
  return useQuery({
    queryKey: swimmerKeys.progression(swimmerId ?? ""),
    enabled: !!swimmerId,
    queryFn: async () => {
      const { data, error } = await getTimeProgression(swimmerId!);
      if (error) throw error;
      return (data ?? []) as ProgressionRow[];
    },
  });
}

/** A single swimmer's season summary (null when there's no data yet). */
export function useSwimmerSeasonDetail(swimmerId: string | undefined, year: number) {
  return useQuery({
    queryKey: swimmerKeys.seasonDetail(swimmerId ?? "", year),
    enabled: !!swimmerId,
    queryFn: async () => {
      const { data, error } = await getSwimmerSeasonDetail(swimmerId!, year);
      if (error) throw error;
      return (data ?? null) as SwimmerSummary | null;
    },
  });
}

export async function getSwimmerProfile(swimmerId: string) {
  return supabase
    .from("swimmers")
    .select(`
      *,
      yearly_goals(*),
      personal_records(*)
    `)
    .eq("id", swimmerId)
    .single();
}

export async function getTimeProgression(swimmerId: string) {
  return supabase
    .from("swimmer_time_progression")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .order("competition_date", { ascending: true });
}

export async function getSwimmerSeasonDetail(swimmerId: string, year: number) {
  return supabase
    .from("swimmer_season_summary")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .eq("season_year", year)
    .maybeSingle();
}

/** A swimmer's recent workouts (with per-workout sets), newest first. */
export function useRecentWorkouts(swimmerId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: swimmerKeys.recentWorkouts(swimmerId ?? "", limit),
    enabled: !!swimmerId,
    queryFn: async () => {
      const { data, error } = await getRecentWorkouts(swimmerId!, limit);
      if (error) throw error;
      return (data ?? []) as RecentWorkout[];
    },
  });
}

export async function getRecentWorkouts(swimmerId: string, limit = 10) {
  return supabase
    .from("workout_attendance")
    .select(`
      actual_pool_m,
      recorded_at,
      workouts(workout_date, workout_type, pool_sets(intensity_zone, total_m))
    `)
    .eq("swimmer_id", swimmerId)
    .order("recorded_at", { ascending: false })
    .limit(limit);
}
