import { View, StyleSheet, type StyleProp, type ViewStyle, type DimensionValue } from "react-native";
import { ZONES, ZONE_ORDER, type IntensityZone } from "@/constants/zones";
import { color, radius } from "@/constants/theme";

interface Props {
  /** Per-zone weight (% or metres); segments are proportional, zeros dropped. */
  weights: Record<IntensityZone, number>;
  /** Planned split — drawn as boundary ticks so the actual-vs-plan gap is the read. */
  targets?: Record<IntensityZone, number>;
  /** Bar height; defaults to the card/hero thickness. */
  thickness?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * The PK→MAK intensity split as one proportional heat-ramp bar. Shared by the
 * roster card (under the harjoitukset/teho hero) and the detail page's zone plan.
 * Pass `targets` to overlay the planned boundaries — the gap between a segment edge
 * and its tick is that zone's deviation (the teho-osuvuus signal).
 */
export function ZoneBar({ weights, targets, thickness = 8, style }: Props) {
  const segments = ZONE_ORDER.filter((z) => weights[z] > 0);
  if (segments.length === 0) return null;
  return (
    <View style={[styles.row, { height: thickness }, style]}>
      {segments.map((z) => (
        <View key={z} style={{ flex: weights[z], height: thickness, backgroundColor: ZONES[z].color }} />
      ))}
      {targets &&
        boundaryTicks(targets).map((left, i) => (
          <View key={i} style={[styles.tick, { left: `${left}%` as DimensionValue }]} />
        ))}
    </View>
  );
}

/** Cumulative interior boundaries of a split, as 0–100 positions (the last edge is the bar end). */
function boundaryTicks(split: Record<IntensityZone, number>): number[] {
  const total = ZONE_ORDER.reduce((sum, z) => sum + (split[z] || 0), 0);
  if (total <= 0) return [];
  const ticks: number[] = [];
  let cum = 0;
  for (let i = 0; i < ZONE_ORDER.length - 1; i++) {
    cum += split[ZONE_ORDER[i]] || 0;
    if (cum > 0 && cum < total) ticks.push((cum / total) * 100);
  }
  return ticks;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", borderRadius: radius.pill, overflow: "hidden", gap: 1.5 },
  tick: { position: "absolute", top: -2, bottom: -2, width: 2, backgroundColor: color.ink },
});
