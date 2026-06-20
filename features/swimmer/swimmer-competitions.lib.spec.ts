import { describe, expect, it } from "vitest";
import { groupResultsByEvent, type SwimmerResultRow } from "./swimmer-competitions.lib";

function row(over: Partial<SwimmerResultRow>): SwimmerResultRow {
  return {
    distance: "100",
    stroke: "vapaa",
    competition_date: "2026-01-01",
    competition_name: "Kisa",
    result_time_ms: 60_000,
    ...over,
  };
}

describe("groupResultsByEvent", () => {
  it("groups by event and labels the stroke", () => {
    const groups = groupResultsByEvent([
      row({ distance: "100", stroke: "vapaa" }),
      row({ distance: "200", stroke: "selka" }),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].event).toBe("100m Vapaauinti");
  });

  it("finds the best time and orders both ways", () => {
    const [g] = groupResultsByEvent([
      row({ competition_date: "2026-01-01", result_time_ms: 62_000 }),
      row({ competition_date: "2026-05-01", result_time_ms: 59_000 }),
    ]);
    expect(g.bestMs).toBe(59_000);
    expect(g.chrono[0].competition_date).toBe("2026-01-01");
    expect(g.sorted[0].competition_date).toBe("2026-05-01");
  });
});
