/**
 * SwimCoach design tokens — the single source of truth for color, type, spacing,
 * radii and shadow. No screen or component should hardcode a hex value; pull from
 * here instead.
 *
 * Direction — "Pool deck": a palette grounded in the pool itself (deep-water ink,
 * pool cyan, the red of a pace-clock hand), athletic condensed numerals because
 * this app *is* numbers, and the intensity zones double as a cool→hot data
 * heat-ramp. Personality lives in the type and the data treatment, not in chrome.
 */
import { Platform } from "react-native";
import { ZONES, ZONE_ORDER, type IntensityZone } from "./zones";

/* ── Raw palette (named, never consumed directly outside this file) ───────────── */
const palette = {
  deep: "#0B2A3A", // deepest water — primary ink
  abyss: "#06202C",

  pool: "#0EA5C4", // primary — pool cyan (not the generic sky-blue we had)
  poolInk: "#0B7E97",
  poolWash: "#E6F6FA",

  pace: "#E5392B", // the pace-clock hand — alert / accent pop
  paceWash: "#FDECEA",

  // cool, deck-tinted neutrals
  slate: "#566671",
  mist: "#8C9AA3",
  line: "#E5EAED",
  deck: "#F4F6F8", // app background — pool-tile off-white
  tile: "#FBFCFD",
  surface: "#FFFFFF",
  white: "#FFFFFF",

  // status
  good: "#16A34A",
  goodWash: "#E9F6EE",
  warn: "#E8920C",
  warnWash: "#FCF1DE",
  risk: "#DC2626",
  riskWash: "#FCEBEA",
} as const;

/* ── Semantic colors (what the rest of the app uses) ──────────────────────────── */
export const color = {
  bg: palette.deck,
  surface: palette.surface,
  surfaceAlt: palette.tile,

  ink: palette.deep,
  inkMuted: palette.slate,
  inkFaint: palette.mist,
  border: palette.line,

  primary: palette.pool,
  primaryInk: palette.poolInk,
  primaryWash: palette.poolWash,
  onPrimary: palette.white,

  accent: palette.pace,
  accentWash: palette.paceWash,

  good: palette.good,
  goodWash: palette.goodWash,
  warn: palette.warn,
  warnWash: palette.warnWash,
  risk: palette.risk,
  riskWash: palette.riskWash,
} as const;

/** Status tone → matching fg/bg pair, for badges and accents. */
export type Tone = "default" | "good" | "warn" | "risk" | "primary";
export const tone: Record<Tone, { fg: string; bg: string }> = {
  default: { fg: color.inkMuted, bg: palette.deck },
  good: { fg: color.good, bg: color.goodWash },
  warn: { fg: color.warn, bg: color.warnWash },
  risk: { fg: color.risk, bg: color.riskWash },
  primary: { fg: color.primaryInk, bg: color.primaryWash },
};

/** Intensity zones, cool→hot, are the app's data heat-ramp (source: zones.ts). */
export const zoneRamp: { zone: IntensityZone; color: string }[] = ZONE_ORDER.map(
  (z) => ({ zone: z, color: ZONES[z].color }),
);

/* ── Spacing — 4px base ───────────────────────────────────────────────────────── */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

/* ── Radii ────────────────────────────────────────────────────────────────────── */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/* ── Shadow / elevation (cross-platform) ──────────────────────────────────────── */
export const shadow = {
  card: Platform.select({
    web: { boxShadow: "0 1px 2px rgba(11,42,58,0.05), 0 10px 28px rgba(11,42,58,0.06)" },
    default: {
      shadowColor: palette.deep,
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
  }) as object,
  fab: Platform.select({
    web: { boxShadow: "0 8px 24px rgba(14,165,196,0.35)" },
    default: {
      shadowColor: palette.pool,
      shadowOpacity: 0.35,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  }) as object,
} as const;

/* ── Type ─────────────────────────────────────────────────────────────────────── */
/**
 * Font families. Loaded in app/_layout.tsx via @expo-google-fonts; until they load
 * these names fall back to the system font (no crash). Numerals are condensed and
 * athletic (Saira Condensed); UI is a warm grotesque with proper ä/ö (Hanken
 * Grotesk); race times use a tabular mono so they read like a timing board.
 */
export const fontFamily = {
  display: "SairaCondensed_600SemiBold",
  displayHeavy: "SairaCondensed_700Bold",
  body: "HankenGrotesk_400Regular",
  medium: "HankenGrotesk_500Medium",
  semibold: "HankenGrotesk_600SemiBold",
  bold: "HankenGrotesk_700Bold",
  mono: "SplineSansMono_500Medium",
} as const;

/** Use on any numeric Text so digits don't jitter as values change. */
export const tabular = { fontVariant: ["tabular-nums"] as ["tabular-nums"] };

/** Named text styles — spread into a Text style and override color when needed. */
export const type = {
  hero: { fontFamily: fontFamily.displayHeavy, fontSize: 52, lineHeight: 52, letterSpacing: -0.5, color: color.ink, ...tabular },
  display: { fontFamily: fontFamily.display, fontSize: 34, lineHeight: 36, letterSpacing: -0.3, color: color.ink, ...tabular },
  title: { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 28, color: color.ink },
  heading: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22, color: color.ink },
  body: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22, color: color.ink },
  bodyStrong: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 22, color: color.ink },
  statValue: { fontFamily: fontFamily.display, fontSize: 22, lineHeight: 24, color: color.ink, ...tabular },
  mono: { fontFamily: fontFamily.mono, fontSize: 14, lineHeight: 20, color: color.ink, ...tabular },
  caption: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16, color: color.inkMuted },
  /** Uppercase eyebrow — letterSpacing + uppercasing baked in. */
  label: { fontFamily: fontFamily.semibold, fontSize: 10.5, lineHeight: 13, letterSpacing: 0.8, textTransform: "uppercase" as const, color: color.inkFaint },
} as const;

export const theme = { color, tone, zoneRamp, space, radius, shadow, fontFamily, type, tabular } as const;
export default theme;
