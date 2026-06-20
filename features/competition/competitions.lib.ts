/**
 * View-model for the competitions screens. Pure data → view-model + the shapes
 * the screens read; no react / react-native imports. DB rows are loosely typed
 * upstream (generated types are stubs), so the consumed shapes live here.
 */

export interface Competition {
  id: string;
  name: string;
  competition_date: string;
  location: string | null;
  level: string | null;
}

export interface CompetitionResult {
  id: string;
  swimmer_id: string;
  stroke: string;
  distance: string;
  result_time_ms: number;
  place_overall: number | null;
  is_personal_best: boolean | null;
  swimmers?: { id: string; full_name: string } | null;
}

export interface CompetitionWithResults extends Competition {
  competition_results: CompetitionResult[] | null;
}

export interface YearGroup {
  year: string;
  competitions: Competition[];
}

/** Group competitions by their year, newest year first. */
export function groupByYear(competitions: Competition[]): YearGroup[] {
  const byYear = new Map<string, Competition[]>();
  for (const c of competitions) {
    const year = c.competition_date.slice(0, 4);
    const list = byYear.get(year);
    if (list) list.push(c);
    else byYear.set(year, [c]);
  }
  return [...byYear.entries()]
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, comps]) => ({ year, competitions: comps }));
}

export interface SwimmerResults {
  swimmerId: string;
  name: string;
  results: CompetitionResult[];
}

/** Group a competition's results by swimmer, preserving first-seen order. */
export function groupResultsBySwimmer(results: CompetitionResult[]): SwimmerResults[] {
  const map = new Map<string, SwimmerResults>();
  for (const r of results) {
    const existing = map.get(r.swimmer_id);
    if (existing) existing.results.push(r);
    else map.set(r.swimmer_id, { swimmerId: r.swimmer_id, name: r.swimmers?.full_name ?? "—", results: [r] });
  }
  return [...map.values()];
}
