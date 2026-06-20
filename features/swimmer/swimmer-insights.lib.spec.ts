import { describe, expect, it } from "vitest";
import { swimmerInsights } from "./swimmer-insights.lib";
import type { SwimmerSummary } from "./swimmer-card.lib";

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

describe("swimmerInsights", () => {
  it("returns nothing without a goal to judge against", () => {
    expect(swimmerInsights(null, 0.5)).toEqual([]);
    expect(swimmerInsights(swimmer({ target_pool_m: 0 }), 0.5)).toEqual([]);
  });

  it("flags being behind the season pace as a risk", () => {
    const [first] = swimmerInsights(swimmer({ target_pool_m: 100_000, goal_pool_pct: 20 }), 0.5);
    expect(first.tone).toBe("risk");
    expect(first.text).toContain("jäljessä");
  });

  it("credits being ahead of pace", () => {
    const [first] = swimmerInsights(swimmer({ target_pool_m: 100_000, goal_pool_pct: 80 }), 0.5);
    expect(first.tone).toBe("good");
    expect(first.text).toContain("Edellä");
  });

  it("names the zone furthest below its planned share", () => {
    const items = swimmerInsights(
      swimmer({
        target_pool_m: 100_000, goal_pool_pct: 50,
        target_pct_pk: 40, target_pct_vk: 30, target_pct_mk: 20, target_pct_mak: 10,
        pct_pk: 70, pct_vk: 30, pct_mk: 0, pct_mak: 0,
      }),
      0.5,
    );
    const zone = items.find((i) => i.tone === "warn");
    expect(zone?.text).toContain("MK"); // 0% vs 20% planned is the worst gap
  });

  it("says on-track when nothing is off-plan", () => {
    const items = swimmerInsights(swimmer({ target_pool_m: 100_000, goal_pool_pct: 50 }), 0.5);
    expect(items).toEqual([{ tone: "good", text: "Aikataulussa — jatka samaan malliin." }]);
  });

  it("returns at most three", () => {
    const items = swimmerInsights(
      swimmer({
        target_pool_m: 100_000, goal_pool_pct: 10,
        target_workouts: 100, total_workouts: 5,
        target_pct_pk: 40, target_pct_vk: 30, target_pct_mk: 20, target_pct_mak: 10,
        pct_pk: 100, pct_vk: 0, pct_mk: 0, pct_mak: 0,
      }),
      0.5,
    );
    expect(items.length).toBeLessThanOrEqual(3);
  });
});
