/**
 * View-model for the coach's swimmer-detail screen. Pure data → view-model and
 * the shapes the screen reads; no react / react-native imports. The DB rows are
 * still loosely typed upstream (generated types are stubs), so the shapes the
 * view depends on are declared here, the same way `swimmer-card.lib` declares
 * `SwimmerSummary`.
 */
import type { IntensityZone } from "@/constants/zones";

export interface PersonalRecord {
  id: string;
  stroke: string;
  distance: string;
  best_time_ms: number;
  is_baseline: boolean | null;
}

export interface YearlyGoal {
  season_year: number;
  target_pool_km: number | null;
  target_dryland_hours: number | null;
  target_workouts: number | null;
  target_stroke: string | null;
  target_distance: string | null;
  target_time_ms: number | null;
  target_pct_pk: number | null;
  target_pct_vk: number | null;
  target_pct_mk: number | null;
  target_pct_mak: number | null;
}

export interface SwimmerProfile {
  id: string;
  full_name: string;
  birth_date: string | null;
  yearly_goals: YearlyGoal[] | null;
  personal_records: PersonalRecord[] | null;
}

export interface ProgressionRow {
  distance: string;
  stroke: string;
  competition_date: string;
  competition_name: string | null;
  result_time_ms: number;
  improvement_pct: number | null;
}

export interface ProgressionEvent {
  /** "<distance>m <stroke>", e.g. "100m vapaa". */
  event: string;
  /** Rows for this event, in chronological order (as queried). */
  results: ProgressionRow[];
  /** Baseline − latest in ms (positive = got faster); null for a single date. */
  improvedMs: number | null;
}

export type ZoneRecord = Record<IntensityZone, number>;

/** A season-summary row's zone-percentage fields (actual + planned). */
interface ZoneSource {
  pct_pk: number | null;
  pct_vk: number | null;
  pct_mk: number | null;
  pct_mak: number | null;
}

/** Group progression rows by event and compute each event's net improvement. */
export function groupProgression(rows: ProgressionRow[]): ProgressionEvent[] {
  const byEvent = new Map<string, ProgressionRow[]>();
  for (const r of rows) {
    const key = `${r.distance}m ${r.stroke}`;
    const list = byEvent.get(key);
    if (list) list.push(r);
    else byEvent.set(key, [r]);
  }
  return [...byEvent.entries()].map(([event, results]) => {
    const latest = results[results.length - 1];
    const baseline = results[0];
    const improvedMs =
      latest && baseline && latest.competition_date !== baseline.competition_date
        ? baseline.result_time_ms - latest.result_time_ms
        : null;
    return { event, results, improvedMs };
  });
}

/** Actual zone split (0 when no data). */
export function actualZones(summary: ZoneSource | null | undefined): ZoneRecord {
  return {
    pk: summary?.pct_pk ?? 0,
    vk: summary?.pct_vk ?? 0,
    mk: summary?.pct_mk ?? 0,
    mak: summary?.pct_mak ?? 0,
  };
}

/** Planned zone split from the yearly goal, or undefined when no goal is set. */
export function targetZones(goal: YearlyGoal | undefined): ZoneRecord | undefined {
  if (!goal) return undefined;
  return {
    pk: goal.target_pct_pk ?? 0,
    vk: goal.target_pct_vk ?? 0,
    mk: goal.target_pct_mk ?? 0,
    mak: goal.target_pct_mak ?? 0,
  };
}

/** The yearly goal for `year`, if the swimmer has one. */
export function goalForYear(profile: SwimmerProfile, year: number): YearlyGoal | undefined {
  return profile.yearly_goals?.find((g) => g.season_year === year);
}
