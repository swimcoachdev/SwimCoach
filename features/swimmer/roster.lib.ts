/**
 * Roster-level aggregates for the coach dashboard header — the totals across the
 * whole (filtered) roster. Kept out of the route so the page stays a thin
 * orchestrator. Pure data → view-model; no react / react-native imports.
 */
import { goalPct, km, type SwimmerSummary } from "./swimmer-card.lib";

export interface RosterStats {
  /** Combined pool volume across the roster, in km. */
  totalKm: number;
  /** Mean season-goal completion, 0–100 — same `goal_pool_pct` source the cards show. */
  avgGoalPct: number;
  /** Number of swimmers in the (filtered) roster. */
  count: number;
}

export function rosterStats(swimmers: SwimmerSummary[]): RosterStats {
  const count = swimmers.length;
  if (count === 0) return { totalKm: 0, avgGoalPct: 0, count: 0 };

  const totalM = swimmers.reduce((sum, s) => sum + (s.total_pool_m ?? 0), 0);
  const avgGoalPct = Math.round(swimmers.reduce((sum, s) => sum + goalPct(s), 0) / count);
  return { totalKm: km(totalM), avgGoalPct, count };
}

/** Case-insensitive name search over a roster. Empty query → unchanged. */
export function filterRoster(swimmers: SwimmerSummary[], query: string): SwimmerSummary[] {
  const q = query.trim().toLowerCase();
  if (!q) return swimmers;
  return swimmers.filter((s) => s.full_name.toLowerCase().includes(q));
}
