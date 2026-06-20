/**
 * Roster triage for the coach's Koti landing: which swimmers need a look, and why.
 * Pure data → view-model (the season clock is passed in so this stays testable; no
 * react / react-native imports).
 *
 * Derived only from the `swimmer_season_summary` fields we already have. Two more
 * signals the IA calls for — "ei harjoitellut" (days since last session) and "kisat
 * tulossa" — need data this view doesn't carry, so they are deliberately left to a
 * follow-up rather than faked here.
 */
import { goalPct, tehoScore, type SwimmerSummary } from "./swimmer-card.lib";

export type AttentionReason = "behind" | "teho";

export interface AttentionItem {
  swimmer_id: string;
  full_name: string;
  reason: AttentionReason;
  /** Short pill text. */
  label: string;
  /** One-line "why", already localized. */
  detail: string;
  /** Sort weight only — higher is more urgent. */
  severity: number;
}

const round = (n: number) => Math.round(n);

/** How far behind the season clock counts as "jäljessä" — matches `trackStatus`. */
const BEHIND_PTS = 5;
/** Teho-osuvuus below this is "hakoteillä" — matches the card's risk tone (<70). */
const TEHO_RISK = 70;

export function rosterAttention(swimmers: SwimmerSummary[], seasonProgress: number): AttentionItem[] {
  const expected = round(seasonProgress * 100);
  const items: AttentionItem[] = [];

  for (const s of swimmers) {
    // Behind the season pace on the headline goal metric — the primary flag.
    if ((s.target_pool_m ?? 0) > 0) {
      const behind = expected - goalPct(s);
      if (behind > BEHIND_PTS) {
        items.push({
          swimmer_id: s.swimmer_id,
          full_name: s.full_name,
          reason: "behind",
          label: "jäljessä",
          detail: `${behind}% jäljessä aikataulusta`,
          severity: 1000 + behind,
        });
        continue; // don't double-flag the same swimmer on a secondary signal
      }
    }
    // Zone split drifting from plan.
    const teho = tehoScore(s);
    if (teho != null && teho < TEHO_RISK) {
      items.push({
        swimmer_id: s.swimmer_id,
        full_name: s.full_name,
        reason: "teho",
        label: "teho",
        detail: `teho-osuvuus ${teho}%`,
        severity: 100 + (TEHO_RISK - teho),
      });
    }
  }

  return items.sort((a, b) => b.severity - a.severity);
}
