/**
 * Deterministic "mitä seuraavaksi" for a swimmer — a short, ranked read of where
 * they're off their plan, derived from the season-summary row. Rule-based for
 * now; the roadmap keeps this as the copilot's zero-cost offline fallback. Pure
 * (the season clock is passed in); no react / react-native imports.
 */
import { ZONES, ZONE_ORDER, type IntensityZone } from "@/constants/zones";
import { goalPct, type SwimmerSummary } from "./swimmer-card.lib";

export type InsightTone = "good" | "warn" | "risk";

export interface Insight {
  tone: InsightTone;
  text: string;
}

const round = (x: number) => Math.round(x);
const num = (v: number | null | undefined) => v ?? 0;

const ZONE_PCT: Record<IntensityZone, keyof SwimmerSummary> = {
  pk: "pct_pk", vk: "pct_vk", mk: "pct_mk", mak: "pct_mak",
};
const TARGET_PCT: Record<IntensityZone, keyof SwimmerSummary> = {
  pk: "target_pct_pk", vk: "target_pct_vk", mk: "target_pct_mk", mak: "target_pct_mak",
};

/** At most three insights, most actionable first. Empty when there's no goal to judge against. */
export function swimmerInsights(s: SwimmerSummary | null, seasonProgress: number): Insight[] {
  if (!s || num(s.target_pool_m) <= 0) return [];

  const out: Insight[] = [];
  const expected = round(seasonProgress * 100);

  // 1) Pace against the season clock on the headline goal.
  const paceDiff = goalPct(s) - expected;
  if (paceDiff < -5) {
    out.push({ tone: "risk", text: `Kausitavoitteesta jäljessä — noin ${Math.abs(paceDiff)}% aikataulun takana.` });
  } else if (paceDiff > 5) {
    out.push({ tone: "good", text: `Edellä aikataulua — ${paceDiff}% tavoitetahtia edellä.` });
  }

  // 2) The single zone furthest below its planned share.
  const hasZoneTarget = ZONE_ORDER.some((z) => s[TARGET_PCT[z]] != null);
  if (hasZoneTarget) {
    let worst: { zone: IntensityZone; diff: number } | null = null;
    for (const z of ZONE_ORDER) {
      const diff = num(s[ZONE_PCT[z]] as number) - num(s[TARGET_PCT[z]] as number);
      if (!worst || diff < worst.diff) worst = { zone: z, diff };
    }
    if (worst && worst.diff <= -5) {
      const z = worst.zone;
      out.push({
        tone: "warn",
        text: `${ZONES[z].label}-osuus alle tavoitteen: ${round(num(s[ZONE_PCT[z]] as number))}% (tavoite ${round(num(s[TARGET_PCT[z]] as number))}%).`,
      });
    }
  }

  // 3) Training frequency lagging the pace.
  if (num(s.target_workouts) > 0) {
    const expectedWorkouts = round(seasonProgress * num(s.target_workouts));
    if (num(s.total_workouts) < expectedWorkouts - 1) {
      out.push({ tone: "warn", text: `Harjoituskertoja ${num(s.total_workouts)}/${num(s.target_workouts)} — tahtiin nähden jäljessä.` });
    }
  }

  if (out.length === 0) {
    out.push({ tone: "good", text: "Aikataulussa — jatka samaan malliin." });
  }
  return out.slice(0, 3);
}
