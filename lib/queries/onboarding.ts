import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { upsertYearlyGoal } from "@/lib/queries/goals";
import { timeStringToMs } from "@/lib/utils/time";
import type { OnboardingData } from "@/types/onboarding";

export interface SaveOnboardingInput {
  swimmerId: string;
  data: OnboardingData;
}

/**
 * Persist the onboarding wizard's result: the yearly goal, any baseline PRs,
 * and the swimmer's onboarding_done flag — in that order.
 */
export async function saveOnboarding({ swimmerId, data }: SaveOnboardingInput) {
  const year = new Date().getFullYear();

  const { error: goalErr } = await upsertYearlyGoal({
    swimmer_id: swimmerId,
    season_year: year,
    target_pool_km: data.targetPoolKm ? parseFloat(data.targetPoolKm) : undefined,
    target_dryland_hours: data.targetDrylandHours ? parseFloat(data.targetDrylandHours) : undefined,
    target_workouts: data.targetWorkouts ? parseInt(data.targetWorkouts) : undefined,
    target_pct_pk: data.targetPctPk,
    target_pct_vk: data.targetPctVk,
    target_pct_mk: data.targetPctMk,
    target_pct_mak: data.targetPctMak,
    target_stroke: data.goalStroke,
    target_distance: String(data.goalDistance),
    target_time_ms: data.goalTimeString ? timeStringToMs(data.goalTimeString) : undefined,
  });
  if (goalErr) throw goalErr;

  if (data.baselines.length > 0) {
    const setAt = new Date().toISOString().split("T")[0];
    const { error: prErr } = await supabase.from("personal_records").upsert(
      data.baselines.map((b) => ({
        swimmer_id: swimmerId,
        stroke: b.stroke,
        distance: String(b.distance),
        best_time_ms: timeStringToMs(b.timeString),
        set_at: setAt,
        is_baseline: true,
      })),
      { onConflict: "swimmer_id,stroke,distance" },
    );
    if (prErr) throw prErr;
  }

  const { error: doneErr } = await supabase
    .from("swimmers")
    .update({ onboarding_done: true })
    .eq("id", swimmerId);
  if (doneErr) throw doneErr;
}

export function useSaveOnboarding() {
  return useMutation({ mutationFn: saveOnboarding });
}
