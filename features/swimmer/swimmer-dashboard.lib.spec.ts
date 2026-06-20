import { describe, expect, it } from "vitest";
import { recentSets, recentVolume, type RecentWorkout } from "./swimmer-dashboard.lib";

function workout(over: Partial<RecentWorkout>): RecentWorkout {
  return { actual_pool_m: 0, recorded_at: "2026-01-01", workouts: null, ...over };
}

describe("recentVolume", () => {
  it("sums actual metres and converts to km", () => {
    const v = recentVolume([
      workout({ actual_pool_m: 3_000 }),
      workout({ actual_pool_m: 2_500 }),
      workout({ actual_pool_m: null }),
    ]);
    expect(v.totalM).toBe(5_500);
    expect(v.totalKm).toBe(5.5);
  });
});

describe("recentSets", () => {
  it("flattens pool sets across workouts", () => {
    const sets = recentSets([
      workout({
        workouts: {
          workout_date: "2026-01-01",
          workout_type: "uinti",
          pool_sets: [
            { intensity_zone: "pk", total_m: 1_000 },
            { intensity_zone: "vk", total_m: 500 },
          ],
        },
      }),
      workout({ workouts: { workout_date: "2026-01-02", workout_type: "uinti", pool_sets: null } }),
    ]);
    expect(sets).toEqual([
      { total_m: 1_000, intensity_zone: "pk" },
      { total_m: 500, intensity_zone: "vk" },
    ]);
  });
});
