import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { color, space, radius, shadow, type as typeStyles } from "@/constants/theme";
import {
  type SwimmerSummary,
  type LensKey,
  LENSES,
  heroFor,
  subStats,
  zoneSegments,
  trackStatus,
} from "@/lib/swimmer-card.lib";

interface Props {
  swimmer: SwimmerSummary;
  /** The active roster lens — drives the adaptive hero number and which stat it is. */
  lens: LensKey;
  /** 1-based position in the ranked roster (hidden for the A–Z lens). */
  rank: number;
  /** 0–1 fraction of the season elapsed, for the on-track signal. */
  seasonProgress: number;
  onPress: () => void;
}

export function SwimmerCard({ swimmer, lens, rank, seasonProgress, onPress }: Props) {
  const hero = heroFor(lens, swimmer);
  const track = trackStatus(swimmer, seasonProgress);
  const segments = zoneSegments(swimmer);
  const heroLens = lens === "name" ? "goal" : lens;
  const heroLabel = LENSES.find((l) => l.key === heroLens)?.label ?? "";
  const rows = subStats(swimmer, lens).filter((st) => !st.active);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Identity */}
      <View style={styles.topRow}>
        <View style={styles.nameWrap}>
          {lens !== "name" && (
            <Text variant="mono" color={color.inkFaint} style={styles.rank}>
              {rank < 10 ? `0${rank}` : rank}
            </Text>
          )}
          <Text variant="heading" numberOfLines={1} style={styles.name}>
            {swimmer.full_name}
          </Text>
        </View>
        <Badge label={track.label} tone={track.tone === "default" ? "default" : track.tone} />
      </View>

      {/* Adaptive hero */}
      <View style={styles.heroBlock}>
        <Text variant="label">{heroLabel}</Text>
        <View style={styles.heroValueRow}>
          <Text variant="hero">{hero.value}</Text>
          {hero.unit && (
            <Text variant="display" color={color.inkMuted} style={styles.heroUnit}>
              {hero.unit}
            </Text>
          )}
        </View>
        <Text variant="caption">{hero.caption}</Text>
      </View>

      <View style={styles.hr} />

      {/* The remaining fixed sub-stats */}
      <View style={styles.statRows}>
        {rows.map((st) => (
          <View key={st.label} style={styles.statRow}>
            <Text variant="caption" color={color.inkMuted}>{st.label}</Text>
            <Text
              variant="statValue"
              color={st.tone && st.tone !== "default" ? color[st.tone] : color.ink}
              style={styles.statValue}
            >
              {st.value}
              {st.unit ? <Text variant="caption" color={color.inkFaint}>{` ${st.unit}`}</Text> : null}
            </Text>
          </View>
        ))}
      </View>

      {/* Zone heat-ramp */}
      {segments.length > 0 && (
        <View style={styles.zoneBar}>
          {segments.map((seg) => (
            <View key={seg.zone} style={[styles.zoneSeg, { flex: seg.pct, backgroundColor: seg.color }]} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: 260,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.border,
    padding: space.lg,
    ...shadow.card,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.sm },
  nameWrap: { flexDirection: "row", alignItems: "center", gap: space.sm, flex: 1 },
  rank: { fontSize: 12 },
  name: { flexShrink: 1 },

  heroBlock: { marginTop: space.lg },
  heroValueRow: { flexDirection: "row", alignItems: "baseline", gap: space.xs },
  heroUnit: { transform: [{ translateY: -2 }] },

  hr: { height: StyleSheet.hairlineWidth, backgroundColor: color.border, marginVertical: space.md },

  statRows: { gap: space.sm },
  statRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statValue: { ...typeStyles.statValue, fontSize: 17 },

  zoneBar: {
    flexDirection: "row",
    height: 5,
    borderRadius: radius.pill,
    overflow: "hidden",
    marginTop: space.lg,
    gap: 1.5,
  },
  zoneSeg: { height: 5 },
});
