import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { YearlyGoal } from "@/features/swimmer/swimmer-detail.lib";

export const goalKeys = {
  all: ["goals"] as const,
  yearly: (swimmerId: string, year: number) => [...goalKeys.all, swimmerId, year] as const,
};

/** A swimmer's yearly goal for `year`, or null when none is set. */
export function useYearlyGoal(swimmerId: string | undefined, year: number) {
  return useQuery({
    queryKey: goalKeys.yearly(swimmerId ?? "", year),
    enabled: !!swimmerId,
    queryFn: async () => {
      const { data, error } = await getYearlyGoal(swimmerId!, year);
      if (error) throw error;
      return (data ?? null) as YearlyGoal | null;
    },
  });
}

export async function upsertYearlyGoal(goal: {
  swimmer_id: string;
  season_year: number;
  target_pool_km?: number;
  target_dryland_hours?: number;
  target_workouts?: number;
  target_pct_pk?: number;
  target_pct_vk?: number;
  target_pct_mk?: number;
  target_pct_mak?: number;
  target_stroke?: string;
  target_distance?: string;
  target_time_ms?: number;
}) {
  return supabase
    .from("yearly_goals")
    .upsert(goal, { onConflict: "swimmer_id,season_year" })
    .select()
    .single();
}

export async function getYearlyGoal(swimmerId: string, year: number) {
  return supabase
    .from("yearly_goals")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .eq("season_year", year)
    .maybeSingle();
}
