/**
 * View-model for the coach's swimmer-detail screen. Pure data → view-model and
 * the shapes the screen reads; no react / react-native imports. The DB rows are
 * still loosely typed upstream (generated types are stubs), so the shapes the
 * view depends on are declared here, the same way `swimmer-card.lib` declares
 * `SwimmerSummary`.
 */
import type { IntensityZone } from "@/constants/zones";
import { STROKES } from "@/constants/strokes";

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

/** One race event for the detail page, merging the goal, the PR and the season trend. */
export interface RaceLine {
  key: string;
  /** "100m Perhonen" — distance + the stroke's label, never the raw code. */
  label: string;
  /** Personal best in ms, or null when only a goal/trend exists. */
  prMs: number | null;
  /** Net season improvement in ms (positive = faster), or null. */
  improvedMs: number | null;
  /** This is the swimmer's goal event. */
  isGoal: boolean;
  /** Goal time in ms when this is the goal event. */
  targetMs: number | null;
}

const raceLabel = (distance: string, stroke: string) =>
  `${distance}m ${STROKES[stroke as keyof typeof STROKES]?.label ?? stroke}`;

/**
 * Collapse the three race views (yearly goal · PRs · competition progression)
 * into one event-keyed list so an event the swimmer focuses on shows once, not
 * three times. Goal event first.
 */
export function raceLines(
  prs: PersonalRecord[],
  goal: YearlyGoal | undefined,
  events: ProgressionEvent[],
): RaceLine[] {
  const byKey = new Map<string, RaceLine>();
  const key = (distance: string, stroke: string) => `${distance}|${stroke}`;
  const ensure = (distance: string, stroke: string): RaceLine => {
    const k = key(distance, stroke);
    let line = byKey.get(k);
    if (!line) {
      line = { key: k, label: raceLabel(distance, stroke), prMs: null, improvedMs: null, isGoal: false, targetMs: null };
      byKey.set(k, line);
    }
    return line;
  };

  for (const pr of prs) {
    const line = ensure(pr.distance, pr.stroke);
    if (line.prMs == null || pr.best_time_ms < line.prMs) line.prMs = pr.best_time_ms;
  }

  for (const ev of events) {
    const first = ev.results[0];
    if (!first) continue;
    ensure(first.distance, first.stroke).improvedMs = ev.improvedMs;
  }

  if (goal?.target_stroke && goal.target_distance) {
    const line = ensure(goal.target_distance, goal.target_stroke);
    line.isGoal = true;
    line.targetMs = goal.target_time_ms;
  }

  return [...byKey.values()].sort((a, b) => Number(b.isGoal) - Number(a.isGoal));
}
