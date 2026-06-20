import { describe, expect, it } from "vitest";
import {
  groupByYear,
  groupResultsBySwimmer,
  type Competition,
  type CompetitionResult,
} from "./competitions.lib";

function comp(over: Partial<Competition>): Competition {
  return { id: "c", name: "Kisa", competition_date: "2026-05-01", location: null, level: null, ...over };
}

function result(over: Partial<CompetitionResult>): CompetitionResult {
  return {
    id: "r",
    swimmer_id: "s1",
    stroke: "vapaa",
    distance: "100",
    result_time_ms: 60_000,
    place_overall: null,
    is_personal_best: null,
    ...over,
  };
}

describe("groupByYear", () => {
  it("groups by year, newest first", () => {
    const groups = groupByYear([
      comp({ id: "a", competition_date: "2025-03-01" }),
      comp({ id: "b", competition_date: "2026-01-01" }),
      comp({ id: "c", competition_date: "2025-09-01" }),
    ]);
    expect(groups.map((g) => g.year)).toEqual(["2026", "2025"]);
    expect(groups[1].competitions).toHaveLength(2);
  });
});

describe("groupResultsBySwimmer", () => {
  it("groups results by swimmer and keeps first-seen order", () => {
    const groups = groupResultsBySwimmer([
      result({ id: "1", swimmer_id: "s1", swimmers: { id: "s1", full_name: "Aino" } }),
      result({ id: "2", swimmer_id: "s2", swimmers: { id: "s2", full_name: "Veikko" } }),
      result({ id: "3", swimmer_id: "s1" }),
    ]);
    expect(groups.map((g) => g.swimmerId)).toEqual(["s1", "s2"]);
    expect(groups[0].name).toBe("Aino");
    expect(groups[0].results).toHaveLength(2);
  });
});
