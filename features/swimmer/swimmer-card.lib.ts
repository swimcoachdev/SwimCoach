/**
 * Pure presentation logic for the swimmer card and the roster lens.
 *
 * The card mirrors the client's FUT-card idea: a fixed set of sub-stats plus one
 * big "hero" number — but the hero is *adaptive*, it shows whatever metric the
 * roster is currently ranked by, so the card always answers the question the coach
 * is looking at. No react / react-native imports — this is pure data → view-model.
 */
import { ZONES, ZONE_ORDER, type IntensityZone } from "@/constants/zones";

/** Row of `swimmer_season_summary` as the card consumes it. */
export interface SwimmerSummary {
  swimmer_id: string;
  full_name: string;
  total_pool_m: number | null;
  target_pool_m: number | null;
  total_workouts: number | null;
  target_workouts: number | null;
  pct_pk: number | null;
  pct_vk: number | null;
  pct_mk: number | null;
  pct_mak: number | null;
  target_pct_pk: number | null;
  target_pct_vk: number | null;
  target_pct_mk: number | null;
  target_pct_mak: number | null;
  goal_pool_pct: number | null;
}

/* ── Lenses (the roster "menus" — what to rank + headline by) ──────────────────── */

export type LensKey = "name" | "goal" | "volume" | "workouts" | "teho";

export interface Lens {
  key: LensKey;
  label: string;
}

export const LENSES: Lens[] = [
  { key: "name", label: "A–Z" },
  { key: "goal", label: "Tavoite" },
  { key: "volume", label: "Volyymi" },
  { key: "workouts", label: "Harjoitukset" },
  { key: "teho", label: "Teho" },
];

/* ── Small derivations ────────────────────────────────────────────────────────── */

const round = (n: number) => Math.round(n);
const n = (v: number | null | undefined) => v ?? 0;

/** Metres → kilometres, one decimal. */
export function km(metres: number | null): number {
  return Math.round(n(metres) / 100) / 10;
}

export function goalPct(s: SwimmerSummary): number {
  return round(n(s.goal_pool_pct));
}

const ZONE_PCT: Record<IntensityZone, keyof SwimmerSummary> = {
  pk: "pct_pk",
  vk: "pct_vk",
  mk: "pct_mk",
  mak: "pct_mak",
};
const TARGET_PCT: Record<IntensityZone, keyof SwimmerSummary> = {
  pk: "target_pct_pk",
  vk: "target_pct_vk",
  mk: "target_pct_mk",
  mak: "target_pct_mak",
};

/**
 * Teho-osuvuus — how closely the actual zone split matches the planned split,
 * as 0–100 (100 = exact). Total absolute deviation spans 0–200, so halve it.
 * Returns null when this swimmer has no zone targets set.
 */
export function tehoScore(s: SwimmerSummary): number | null {
  const hasTarget = ZONE_ORDER.some((z) => s[TARGET_PCT[z]] != null);
  if (!hasTarget) return null;
  const deviation = ZONE_ORDER.reduce(
    (sum, z) => sum + Math.abs(n(s[ZONE_PCT[z]] as number) - n(s[TARGET_PCT[z]] as number)),
    0,
  );
  return Math.max(0, round(100 - deviation / 2));
}

/* ── Adaptive hero ────────────────────────────────────────────────────────────── */

export interface HeroValue {
  value: string;
  unit?: string;
  caption: string;
}

/** The big number for the active lens. "name" falls back to goal — the identity metric. */
export function heroFor(lens: LensKey, s: SwimmerSummary): HeroValue {
  switch (lens) {
    case "volume":
      return { value: String(km(s.total_pool_m)), unit: "km", caption: `tavoite ${km(s.target_pool_m)} km` };
    case "workouts":
      return { value: String(n(s.total_workouts)), unit: s.target_workouts ? `/ ${s.target_workouts}` : undefined, caption: "harjoitusta" };
    case "teho": {
      const t = tehoScore(s);
      return { value: t == null ? "–" : String(t), unit: t == null ? undefined : "%", caption: "teho-osuvuus" };
    }
    case "goal":
    case "name":
    default:
      return { value: String(goalPct(s)), unit: "%", caption: "kausitavoitteesta" };
  }
}

/* ── Sub-stats (the fixed four, like a FUT card's stat block) ─────────────────── */

export interface SubStat {
  label: string;
  value: string;
  unit?: string;
  tone?: "default" | "good" | "warn" | "risk";
  /** True when this stat is the one the active lens is headlining. */
  active?: boolean;
}

export function subStats(s: SwimmerSummary, lens: LensKey): SubStat[] {
  const teho = tehoScore(s);
  const stats: (SubStat & { lens: LensKey })[] = [
    { lens: "volume", label: "Volyymi", value: String(km(s.total_pool_m)), unit: "km" },
    { lens: "workouts", label: "Harjoitukset", value: String(n(s.total_workouts)), unit: s.target_workouts ? `/${s.target_workouts}` : undefined },
    { lens: "teho", label: "Teho", value: teho == null ? "–" : String(teho), unit: teho == null ? undefined : "%", tone: teho == null ? "default" : teho >= 85 ? "good" : teho >= 70 ? "warn" : "risk" },
    { lens: "goal", label: "Tavoite", value: String(goalPct(s)), unit: "%" },
  ];
  return stats.map(({ lens: l, ...rest }) => ({ ...rest, active: l === lens }));
}

/* ── Zone heat-ramp segments ──────────────────────────────────────────────────── */

export interface ZoneSegment {
  zone: IntensityZone;
  pct: number;
  color: string;
}

export function zoneSegments(s: SwimmerSummary): ZoneSegment[] {
  return ZONE_ORDER.map((zone) => ({
    zone,
    pct: n(s[ZONE_PCT[zone]] as number),
    color: ZONES[zone].color,
  })).filter((seg) => seg.pct > 0);
}

/* ── On-track signal ──────────────────────────────────────────────────────────── */

export type TrackTone = "good" | "warn" | "risk" | "default";

export interface TrackStatus {
  tone: TrackTone;
  label: string;
}

/**
 * Compare goal completion against where the season clock says it should be.
 * `seasonProgress` is 0–1 (fraction of the year elapsed) — passed in so this
 * stays pure and testable.
 */
export function trackStatus(s: SwimmerSummary, seasonProgress: number): TrackStatus {
  if (n(s.target_pool_m) <= 0) return { tone: "default", label: "ei tavoitetta" };
  const expected = round(seasonProgress * 100);
  const diff = goalPct(s) - expected;
  if (diff < -5) return { tone: "risk", label: "jäljessä" };
  if (diff > 5) return { tone: "good", label: "edellä" };
  return { tone: "good", label: "aikataulussa" };
}

/* ── Ranking (drives the auto-sorted roster + the rank index on each card) ────── */

function rankMetric(lens: LensKey, s: SwimmerSummary): number {
  switch (lens) {
    case "volume":
      return n(s.total_pool_m);
    case "workouts":
      return n(s.total_workouts);
    case "teho":
      return tehoScore(s) ?? -1;
    case "goal":
    default:
      return goalPct(s);
  }
}

/** Sort a roster for the active lens: name → A–Z, everything else → high to low. */
export function rankSwimmers(lens: LensKey, swimmers: SwimmerSummary[]): SwimmerSummary[] {
  const copy = [...swimmers];
  if (lens === "name") {
    return copy.sort((a, b) => a.full_name.localeCompare(b.full_name, "fi"));
  }
  return copy.sort((a, b) => rankMetric(lens, b) - rankMetric(lens, a));
}
