import { describe, expect, it } from "vitest";
import { groupProgression, type ProgressionRow } from "./swimmer-detail.lib";

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
