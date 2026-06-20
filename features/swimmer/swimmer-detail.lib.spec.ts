import { describe, expect, it } from "vitest";
import { groupProgression, raceLines, type ProgressionEvent, type ProgressionRow, type YearlyGoal } from "./swimmer-detail.lib";

function row(over: Partial<ProgressionRow>): ProgressionRow {
  return {
    distance: "100",
    stroke: "vapaa",
    competition_date: "2026-01-01",
    competition_name: null,
    result_time_ms: 60_000,
    improvement_pct: null,
    ...over,
  };
}

describe("groupProgression", () => {
  it("groups rows by distance + stroke", () => {
    const events = groupProgression([
      row({ distance: "100", stroke: "vapaa" }),
      row({ distance: "200", stroke: "vapaa" }),
      row({ distance: "100", stroke: "vapaa", competition_date: "2026-03-01" }),
    ]);
    expect(events).toHaveLength(2);
    expect(events.find((e) => e.event === "100m vapaa")?.results).toHaveLength(2);
  });

  it("computes net improvement as baseline minus latest", () => {
    const [e] = groupProgression([
      row({ competition_date: "2026-01-01", result_time_ms: 62_000 }),
      row({ competition_date: "2026-04-01", result_time_ms: 60_000 }),
    ]);
    expect(e.improvedMs).toBe(2_000); // got 2s faster
  });

  it("returns null improvement for a single-date event", () => {
    const [e] = groupProgression([row({ result_time_ms: 60_000 })]);
    expect(e.improvedMs).toBeNull();
  });
});

function goal(over: Partial<YearlyGoal>): YearlyGoal {
  return {
    season_year: 2026,
    target_pool_km: null,
    target_dryland_hours: null,
    target_workouts: null,
    target_stroke: null,
    target_distance: null,
    target_time_ms: null,
    target_pct_pk: null,
    target_pct_vk: null,
    target_pct_mk: null,
    target_pct_mak: null,
    ...over,
  };
}

const progEvent = (distance: string, stroke: string, improvedMs: number | null): ProgressionEvent => ({
  event: `${distance}m ${stroke}`,
  results: [{ distance, stroke, competition_date: "2026-02-01", competition_name: null, result_time_ms: 70_000, improvement_pct: null }],
  improvedMs,
});

describe("raceLines", () => {
  it("merges the goal, PR and trend for one event into a single line", () => {
    const lines = raceLines(
      [{ id: "1", stroke: "perho", distance: "100", best_time_ms: 68_900, is_baseline: false }],
      goal({ target_stroke: "perho", target_distance: "100", target_time_ms: 65_000 }),
      [progEvent("100", "perho", 1_600)],
    );
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ prMs: 68_900, improvedMs: 1_600, isGoal: true, targetMs: 65_000 });
  });

  it("labels with the stroke's name, not the raw code", () => {
    const [line] = raceLines([{ id: "1", stroke: "perho", distance: "100", best_time_ms: 68_900, is_baseline: false }], undefined, []);
    expect(line.label).toBe("100m Perhonen");
  });

  it("keeps the fastest time as the PR", () => {
    const [line] = raceLines(
      [
        { id: "1", stroke: "vapaa", distance: "50", best_time_ms: 30_000, is_baseline: true },
        { id: "2", stroke: "vapaa", distance: "50", best_time_ms: 28_500, is_baseline: false },
      ],
      undefined,
      [],
    );
    expect(line.prMs).toBe(28_500);
  });

  it("sorts the goal event first", () => {
    const lines = raceLines(
      [
        { id: "1", stroke: "vapaa", distance: "200", best_time_ms: 135_000, is_baseline: false },
        { id: "2", stroke: "perho", distance: "100", best_time_ms: 68_900, is_baseline: false },
      ],
      goal({ target_stroke: "perho", target_distance: "100", target_time_ms: 65_000 }),
      [],
    );
    expect(lines[0].label).toBe("100m Perhonen");
    expect(lines[0].isGoal).toBe(true);
  });
});
