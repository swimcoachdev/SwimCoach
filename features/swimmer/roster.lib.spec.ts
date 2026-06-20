import { describe, expect, it } from "vitest";
import { filterRoster, rosterStats } from "./roster.lib";
import type { SwimmerSummary } from "./swimmer-card.lib";

/** Minimal valid summary row; override only the fields a case cares about. */
function swimmer(over: Partial<SwimmerSummary>): SwimmerSummary {
  return {
    swimmer_id: "x",
    full_name: "Test",
    total_pool_m: 0,
    target_pool_m: 0,
    total_workouts: 0,
    target_workouts: 0,
    pct_pk: null,
    pct_vk: null,
    pct_mk: null,
    pct_mak: null,
    target_pct_pk: null,
    target_pct_vk: null,
    target_pct_mk: null,
    target_pct_mak: null,
    goal_pool_pct: 0,
    ...over,
  };
}

describe("rosterStats", () => {
  it("returns zeros for an empty roster", () => {
    expect(rosterStats([])).toEqual({ totalKm: 0, avgGoalPct: 0, count: 0 });
  });

  it("sums volume in km and averages goal completion", () => {
    const r = rosterStats([
      swimmer({ total_pool_m: 120_000, goal_pool_pct: 80 }),
      swimmer({ total_pool_m: 80_000, goal_pool_pct: 60 }),
    ]);
    expect(r.count).toBe(2);
    expect(r.totalKm).toBe(200); // 200_000 m → 200 km
    expect(r.avgGoalPct).toBe(70); // (80 + 60) / 2
  });

  it("treats null volume as zero", () => {
    const r = rosterStats([
      swimmer({ total_pool_m: null, goal_pool_pct: 50 }),
      swimmer({ total_pool_m: 50_000, goal_pool_pct: 50 }),
    ]);
    expect(r.totalKm).toBe(50);
    expect(r.avgGoalPct).toBe(50);
  });
});

describe("filterRoster", () => {
  const roster = [
    swimmer({ swimmer_id: "1", full_name: "Aino Virtanen" }),
    swimmer({ swimmer_id: "2", full_name: "Veikko Mäki" }),
  ];

  it("returns everyone for an empty query", () => {
    expect(filterRoster(roster, "  ")).toHaveLength(2);
  });

  it("matches names case-insensitively", () => {
    expect(filterRoster(roster, "veik").map((s) => s.swimmer_id)).toEqual(["2"]);
  });
});
