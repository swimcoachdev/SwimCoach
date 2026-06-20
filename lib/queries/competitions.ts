import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { swimmerKeys } from "@/lib/queries/swimmers";
import type { Competition, CompetitionWithResults } from "@/features/competition/competitions.lib";

export const competitionKeys = {
  all: ["competitions"] as const,
  byClub: (clubId: string) => [...competitionKeys.all, "by-club", clubId] as const,
  detail: (competitionId: string) => [...competitionKeys.all, "detail", competitionId] as const,
};

/** Every competition for the club, newest first. */
export function useClubCompetitions(clubId: string | undefined) {
  return useQuery({
    queryKey: competitionKeys.byClub(clubId ?? ""),
    enabled: !!clubId,
    queryFn: async () => {
      const { data, error } = await getClubCompetitions(clubId!);
      if (error) throw error;
      return (data ?? []) as Competition[];
    },
  });
}

/** One competition with its nested results. */
export function useCompetitionDetail(competitionId: string | undefined) {
  return useQuery({
    queryKey: competitionKeys.detail(competitionId ?? ""),
    enabled: !!competitionId,
    queryFn: async () => {
      const { data, error } = await getCompetitionWithResults(competitionId!);
      if (error) throw error;
      return data as CompetitionWithResults;
    },
  });
}

export function useCreateCompetition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      club_id: string;
      name: string;
      competition_date: string;
      location?: string;
      level?: string;
    }) => {
      const { data, error } = await createCompetition(input);
      if (error) throw error;
      return data as Competition;
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: competitionKeys.byClub(vars.club_id) }),
  });
}

export interface SaveResultInput {
  competitionId: string;
  competitionDate: string;
  swimmerId: string;
  stroke: string;
  distance: string;
  resultTimeMs: number;
  placeOverall?: number;
}

/** Record a result and bump the swimmer's PR if it beats the current best. */
export function useSaveCompetitionResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveResultInput) => {
      const { error } = await upsertCompetitionResult({
        competition_id: input.competitionId,
        swimmer_id: input.swimmerId,
        stroke: input.stroke,
        distance: input.distance,
        result_time_ms: input.resultTimeMs,
        place_overall: input.placeOverall,
      });
      if (error) throw error;
      await updatePersonalRecord(
        input.swimmerId,
        input.stroke,
        input.distance,
        input.resultTimeMs,
        input.competitionDate,
        input.competitionId,
      );
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: competitionKeys.detail(vars.competitionId) });
      qc.invalidateQueries({ queryKey: swimmerKeys.all }); // a PR may have changed
    },
  });
}

export async function getClubCompetitions(clubId: string) {
  return supabase
    .from("competitions")
    .select("*")
    .eq("club_id", clubId)
    .order("competition_date", { ascending: false });
}

export async function getCompetitionWithResults(competitionId: string) {
  return supabase
    .from("competitions")
    .select(`
      *,
      competition_results(
        *,
        swimmers(id, full_name)
      )
    `)
    .eq("id", competitionId)
    .single();
}

export async function createCompetition(data: {
  club_id: string;
  name: string;
  competition_date: string;
  location?: string;
  level?: string;
}) {
  return supabase.from("competitions").insert(data).select().single();
}

export async function upsertCompetitionResult(result: {
  competition_id: string;
  swimmer_id: string;
  stroke: string;
  distance: string;
  result_time_ms: number;
  place_overall?: number;
  place_age_group?: number;
  notes?: string;
}) {
  return supabase
    .from("competition_results")
    .upsert(result, { onConflict: "competition_id,swimmer_id,stroke,distance" })
    .select()
    .single();
}

export async function updatePersonalRecord(
  swimmerId: string,
  stroke: string,
  distance: string,
  timeMs: number,
  competitionDate: string,
  competitionId: string
) {
  // Hae nykyinen PR
  const { data: existing } = await supabase
    .from("personal_records")
    .select("*")
    .eq("swimmer_id", swimmerId)
    .eq("stroke", stroke)
    .eq("distance", distance)
    .single();

  // Päivitä vain jos parempi aika (tai ei ole PR:ää vielä)
  if (!existing || timeMs < existing.best_time_ms) {
    return supabase
      .from("personal_records")
      .upsert({
        swimmer_id: swimmerId,
        stroke,
        distance,
        best_time_ms: timeMs,
        set_at: competitionDate,
        competition_id: competitionId,
        is_baseline: false,
      }, { onConflict: "swimmer_id,stroke,distance" })
      .select()
      .single();
  }
  return { data: existing, error: null };
}
