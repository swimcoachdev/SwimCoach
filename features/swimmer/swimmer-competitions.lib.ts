/**
 * View-model for the swimmer's own competition-results screen. Groups a flat
 * list of results into per-event blocks with the PR and chrono/recency orders
 * the screen needs. Pure; no react / react-native imports.
 */
import { STROKES } from "@/constants/strokes";

export interface SwimmerResultRow {
  distance: string;
  stroke: string;
  competition_date: string;
  competition_name: string | null;
  result_time_ms: number;
}

export interface EventGroup {
  /** "<distance>m <stroke label>", e.g. "100m Vapaauinti". */
  event: string;
  /** Fastest time across this event's results. */
  bestMs: number;
  /** Oldest → newest, for the mini bar chart. */
  chrono: SwimmerResultRow[];
  /** Newest → oldest, for the result list. */
  sorted: SwimmerResultRow[];
}

export function groupResultsByEvent(rows: SwimmerResultRow[]): EventGroup[] {
  const byEvent = new Map<string, SwimmerResultRow[]>();
  for (const r of rows) {
    const strokeLabel = STROKES[r.stroke as keyof typeof STROKES]?.label ?? r.stroke;
    const key = `${r.distance}m ${strokeLabel}`;
    const list = byEvent.get(key);
    if (list) list.push(r);
    else byEvent.set(key, [r]);
  }
  return [...byEvent.entries()].map(([event, results]) => ({
    event,
    bestMs: Math.min(...results.map((r) => r.result_time_ms)),
    chrono: [...results].sort((a, b) => a.competition_date.localeCompare(b.competition_date)),
    sorted: [...results].sort((a, b) => b.competition_date.localeCompare(a.competition_date)),
  }));
}
