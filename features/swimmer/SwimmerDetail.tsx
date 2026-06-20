import { View, ScrollView, StyleSheet, type DimensionValue } from "react-native";
import { Target } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { Header } from "@/components/ui/Header";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { msToTimeString } from "@/lib/utils/time";
import { km, goalPct, trackStatus, type SwimmerSummary, type TrackTone } from "@/features/swimmer/swimmer-card.lib";
import { swimmerInsights, type InsightTone } from "@/features/swimmer/swimmer-insights.lib";
import {
  actualZones,
  goalForYear,
  groupProgression,
  targetZones,
  type ProgressionRow,
  type SwimmerProfile,
  type ZoneRecord,
} from "@/features/swimmer/swimmer-detail.lib";
import { STROKES } from "@/constants/strokes";
import { ZONES, ZONE_ORDER } from "@/constants/zones";
import { color, space, radius, fontFamily } from "@/constants/theme";

interface Props {
  profile: SwimmerProfile;
  summary: SwimmerSummary | null;
  progression: ProgressionRow[];
  year: number;
  seasonProgress: number;
  onBack: () => void;
}

const TONE_COLOR: Record<TrackTone | InsightTone, string> = {
  good: color.good,
  warn: color.warn,
  risk: color.risk,
  default: color.inkFaint,
};

export function SwimmerDetail({ profile, summary, progression, year, seasonProgress, onBack }: Props) {
  const goal = goalForYear(profile, year);
  const prs = profile.personal_records ?? [];

  const currentKm = km(summary?.total_pool_m ?? 0);
  const targetKm = goal?.target_pool_km ?? 0;
  const hasVolumeGoal = targetKm > 0;
  const pct = summary ? goalPct(summary) : 0;
  const expected = Math.round(seasonProgress * 100);

  const track = summary ? trackStatus(summary, seasonProgress) : null;
  const insights = swimmerInsights(summary, seasonProgress);
  const events = groupProgression(progression);

  const currentWorkouts = summary?.total_workouts ?? 0;
  const targetWorkouts = goal?.target_workouts ?? 0;
  const hasZoneData = (summary?.total_pool_m ?? 0) > 0;

  return (
    <View style={styles.root}>
      <Header
        onBack={onBack}
        title={profile.full_name}
        subtitle={profile.birth_date ? `s. ${new Date(profile.birth_date).getFullYear()}` : undefined}
        right={track && track.tone !== "default" ? <Badge label={track.label} tone={track.tone} /> : undefined}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero — the season headline */}
        <Card>
          <Text variant="label">Kausitavoite {year}</Text>
          {hasVolumeGoal ? (
            <>
              <View style={styles.heroRow}>
                <Text variant="hero">{pct}</Text>
                <Text variant="display" color={color.inkMuted} style={styles.heroUnit}>%</Text>
              </View>
              <View style={styles.paceTrack}>
                <View style={[styles.paceFill, { width: `${Math.min(pct, 100)}%` as DimensionValue, backgroundColor: TONE_COLOR[track?.tone ?? "default"] }]} />
                <View style={[styles.paceMarker, { left: `${Math.min(expected, 100)}%` as DimensionValue }]} />
              </View>
              <Text variant="caption" color={color.inkMuted}>
                {currentKm} / {targetKm} km · tavoitetahti {expected}%
              </Text>
            </>
          ) : (
            <>
              <View style={styles.heroRow}>
                <Text variant="hero">{currentKm}</Text>
                <Text variant="display" color={color.inkMuted} style={styles.heroUnit}>km</Text>
              </View>
              <Text variant="caption" color={color.inkMuted}>Ei vuositavoitetta asetettu.</Text>
            </>
          )}
        </Card>

        {/* Mitä seuraavaksi — deterministic insight */}
        {insights.length > 0 && (
          <Card>
            <Text variant="heading" style={styles.cardTitle}>Mitä seuraavaksi</Text>
            {insights.map((it, i) => (
              <View key={i} style={styles.insightRow}>
                <View style={[styles.insightDot, { backgroundColor: TONE_COLOR[it.tone] }]} />
                <Text variant="body" style={styles.flex}>{it.text}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Remaining goal parts (volume lives in the hero) */}
        {goal && (targetWorkouts > 0 || goal.target_stroke) && (
          <Card>
            <Text variant="heading" style={styles.cardTitle}>Tavoite {year}</Text>
            {targetWorkouts > 0 && (
              <GoalRow label="Harjoituskerrat" current={currentWorkouts} target={targetWorkouts} />
            )}
            {goal.target_stroke && (
              <View style={styles.raceGoal}>
                <View style={styles.raceGoalLeft}>
                  <Target size={15} color={color.primaryInk} strokeWidth={2.2} />
                  <Text variant="bodyStrong" color={color.primaryInk}>
                    {goal.target_distance}m {STROKES[goal.target_stroke as keyof typeof STROKES]?.label}
                  </Text>
                </View>
                <Text variant="mono" color={color.primaryInk}>
                  {goal.target_time_ms ? msToTimeString(goal.target_time_ms) : "—"}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Zone distribution — actual vs plan */}
        <Card>
          <Text variant="heading" style={styles.cardTitle}>Tehoaluejakauma</Text>
          {hasZoneData
            ? <ZoneBar actual={actualZones(summary)} target={targetZones(goal)} />
            : <Text variant="body" color={color.inkMuted}>Ei harjoitusdataa vielä.</Text>}
        </Card>

        {/* PRs */}
        {prs.length > 0 && (
          <Card>
            <Text variant="heading" style={styles.cardTitle}>Henkilökohtaiset ennätykset</Text>
            {prs.map((pr) => (
              <View key={pr.id} style={styles.prRow}>
                <Text variant="body" style={styles.flex}>
                  {pr.distance}m {STROKES[pr.stroke as keyof typeof STROKES]?.label ?? pr.stroke}
                </Text>
                <Text variant="mono" color={color.primaryInk}>{msToTimeString(pr.best_time_ms)}</Text>
                {pr.is_baseline && <Text variant="label" style={styles.baseline}>lähtötaso</Text>}
              </View>
            ))}
          </Card>
        )}

        {/* Competition progression */}
        {events.map(({ event, results, improvedMs }) => (
          <Card key={event}>
            <View style={styles.eventHeader}>
              <Text variant="heading">{event}</Text>
              {improvedMs != null && (
                <Text variant="bodyStrong" color={improvedMs > 0 ? color.good : color.risk}>
                  {improvedMs > 0 ? "−" : "+"}{msToTimeString(Math.abs(improvedMs))}
                </Text>
              )}
            </View>
            {results.slice(-5).map((r) => (
              <View key={r.competition_date + r.result_time_ms} style={styles.resultRow}>
                <Text variant="caption" style={styles.flex}>{r.competition_date}</Text>
                <Text variant="mono">{msToTimeString(r.result_time_ms)}</Text>
                {r.improvement_pct != null && r.improvement_pct > 0 && (
                  <Text variant="label" color={color.good} style={styles.resultImprovement}>−{r.improvement_pct}%</Text>
                )}
              </View>
            ))}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

function ProgressBar({ pct, fill = color.primary }: { pct: number; fill?: string }) {
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%` as DimensionValue, backgroundColor: fill }]} />
    </View>
  );
}

function GoalRow({ label, current, target, unit = "" }: {
  label: string; current: number; target: number; unit?: string;
}) {
  const pct = target > 0 ? Math.round((current / target) * 100) : 0;
  const fill = pct >= 80 ? color.good : pct >= 50 ? color.warn : color.risk;
  return (
    <View style={styles.goalRow}>
      <View style={styles.goalRowTop}>
        <Text variant="caption" color={color.inkMuted}>{label}</Text>
        <Text variant="bodyStrong">
          {current}{unit} / {target}{unit}
          <Text variant="bodyStrong" color={color.primaryInk}> {pct}%</Text>
        </Text>
      </View>
      <ProgressBar pct={pct} fill={fill} />
    </View>
  );
}

function ZoneBar({ actual, target }: { actual: ZoneRecord; target?: ZoneRecord }) {
  const total = ZONE_ORDER.reduce((s, z) => s + (actual[z] ?? 0), 0);
  return (
    <View>
      <View style={styles.zoneBarRow}>
        {ZONE_ORDER.map((z) => {
          const pct = total > 0 ? (actual[z] ?? 0) / total * 100 : 0;
          return pct > 0 ? (
            <View key={z} style={[styles.zoneSegment, { flex: pct, backgroundColor: ZONES[z].color }]} />
          ) : null;
        })}
      </View>
      <View style={styles.zoneLegend}>
        {ZONE_ORDER.map((z) => {
          const pct = total > 0 ? Math.round((actual[z] ?? 0) / total * 100) : 0;
          const tgt = target?.[z] ?? 0;
          const diff = pct - tgt;
          const diffColor = Math.abs(diff) <= 3 ? color.good : diff < 0 ? color.risk : color.warn;
          return (
            <View key={z} style={styles.zoneLegendItem}>
              <View style={[styles.zoneDot, { backgroundColor: ZONES[z].color }]} />
              <Text variant="caption" color={color.inkMuted}>{ZONES[z].label}</Text>
              <Text variant="caption" color={color.ink} style={styles.zonePct}>{pct}%</Text>
              {tgt > 0 && (
                <Text variant="label" color={diffColor}>{diff > 0 ? "+" : ""}{diff}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: space.lg, gap: space.md, paddingBottom: space.xxxl },
  flex: { flex: 1 },
  cardTitle: { marginBottom: space.md },

  heroRow: { flexDirection: "row", alignItems: "baseline", gap: space.xs, marginTop: space.xs },
  heroUnit: { transform: [{ translateY: -2 }] },
  paceTrack: { height: 8, backgroundColor: color.bg, borderRadius: radius.pill, overflow: "hidden", marginTop: space.md, marginBottom: space.sm, position: "relative" },
  paceFill: { height: 8, borderRadius: radius.pill },
  paceMarker: { position: "absolute", top: -2, width: 2, height: 12, backgroundColor: color.ink, borderRadius: 1 },

  insightRow: { flexDirection: "row", alignItems: "flex-start", gap: space.sm, paddingVertical: space.xs + 1 },
  insightDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },

  goalRow: { marginBottom: space.md },
  goalRowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: space.xs },
  barTrack: { height: 6, backgroundColor: color.bg, borderRadius: radius.pill, overflow: "hidden" },
  barFill: { height: 6, borderRadius: radius.pill },

  raceGoal: {
    marginTop: space.sm,
    backgroundColor: color.primaryWash,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  raceGoalLeft: { flexDirection: "row", alignItems: "center", gap: space.sm },

  zoneBarRow: { flexDirection: "row", height: 10, borderRadius: radius.pill, overflow: "hidden", marginBottom: space.md, gap: 1.5 },
  zoneSegment: { height: 10 },
  zoneLegend: { flexDirection: "row", justifyContent: "space-between" },
  zoneLegendItem: { flexDirection: "row", alignItems: "center", gap: space.xs },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  zonePct: { fontFamily: fontFamily.semibold, color: color.ink },

  prRow: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingVertical: space.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  baseline: { color: color.inkFaint },

  eventHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.md },
  resultRow: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingVertical: space.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  resultImprovement: { marginLeft: space.xs },
});
