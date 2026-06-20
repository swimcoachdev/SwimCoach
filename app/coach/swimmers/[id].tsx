import { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, type DimensionValue } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Target } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { Badge } from "@/components/ui/Badge";
import { PaceClock } from "@/components/ui/PaceClock";
import { getSwimmerProfile, getTimeProgression, getSwimmerSeasonDetail } from "@/lib/queries/swimmers";
import { msToTimeString } from "@/lib/utils/time";
import { km, trackStatus, type SwimmerSummary } from "@/features/swimmer/swimmer-card.lib";
import { STROKES } from "@/constants/strokes";
import { ZONES, ZONE_ORDER } from "@/constants/zones";
import { color, space, radius, shadow, fontFamily } from "@/constants/theme";

function seasonProgressNow(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1).getTime();
  const end = new Date(now.getFullYear(), 11, 31).getTime();
  return (now.getTime() - start) / (end - start);
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

function ZoneBar({ actual, target }: {
  actual: Record<string, number>;
  target?: Record<string, number>;
}) {
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

export default function SwimmerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [progression, setProgression] = useState<any[]>([]);
  const year = new Date().getFullYear();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getSwimmerProfile(id).then(({ data }) => setProfile(data)),
      getTimeProgression(id).then(({ data }) => setProgression(data ?? [])),
      getSwimmerSeasonDetail(id, year).then(({ data }) => setSummary(data)),
    ]);
  }, [id]);

  if (!profile) {
    return (
      <View style={styles.loading}>
        <PaceClock size={48} />
      </View>
    );
  }

  const goal = profile.yearly_goals?.find((g: any) => g.season_year === year);
  const prs = profile.personal_records ?? [];

  const actualZones = {
    pk: summary?.pct_pk ?? 0,
    vk: summary?.pct_vk ?? 0,
    mk: summary?.pct_mk ?? 0,
    mak: summary?.pct_mak ?? 0,
  };
  const targetZones = goal ? {
    pk: goal.target_pct_pk ?? 0,
    vk: goal.target_pct_vk ?? 0,
    mk: goal.target_pct_mk ?? 0,
    mak: goal.target_pct_mak ?? 0,
  } : undefined;

  const currentKm = km(summary?.total_pool_m ?? 0);
  const targetKm = goal?.target_pool_km ?? 0;
  const currentWorkouts = summary?.total_workouts ?? 0;
  const targetWorkouts = goal?.target_workouts ?? 0;
  const track = summary ? trackStatus(summary as SwimmerSummary, seasonProgressNow()) : null;

  // Group progression by event
  const progressionByEvent: Record<string, any[]> = {};
  for (const r of progression) {
    const key = `${r.distance}m ${r.stroke}`;
    if (!progressionByEvent[key]) progressionByEvent[key] = [];
    progressionByEvent[key].push(r);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={18} color={color.primary} strokeWidth={2.5} />
          <Text variant="bodyStrong" color={color.primary}>Takaisin</Text>
        </TouchableOpacity>
        <View style={styles.nameRow}>
          <View style={styles.nameWrap}>
            <Text variant="title">{profile.full_name}</Text>
            {profile.birth_date && (
              <Text variant="caption">s. {new Date(profile.birth_date).getFullYear()}</Text>
            )}
          </View>
          {track && track.tone !== "default" && <Badge label={track.label} tone={track.tone} />}
        </View>
      </View>

      <View style={styles.body}>
        {/* Vuositavoite */}
        {goal && (
          <View style={styles.card}>
            <Text variant="heading" style={styles.cardTitle}>Vuositavoite {year}</Text>
            <GoalRow label="Uintimetrit" current={currentKm} target={targetKm} unit=" km" />
            <GoalRow label="Harjoituskerrat" current={currentWorkouts} target={targetWorkouts} />
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
          </View>
        )}

        {/* Tehoaluejakauma */}
        <View style={styles.card}>
          <Text variant="heading" style={styles.cardTitle}>Tehoaluejakauma</Text>
          {(summary?.total_pool_m ?? 0) > 0
            ? <ZoneBar actual={actualZones} target={targetZones} />
            : <Text variant="body" color={color.inkMuted}>Ei harjoitusdataa vielä.</Text>
          }
        </View>

        {/* PR:t */}
        {prs.length > 0 && (
          <View style={styles.card}>
            <Text variant="heading" style={styles.cardTitle}>Henkilökohtaiset ennätykset</Text>
            {prs.map((pr: any) => (
              <View key={pr.id} style={styles.prRow}>
                <Text variant="body" color={color.ink} style={styles.flex}>
                  {pr.distance}m {STROKES[pr.stroke as keyof typeof STROKES]?.label ?? pr.stroke}
                </Text>
                <Text variant="mono" color={color.primaryInk}>{msToTimeString(pr.best_time_ms)}</Text>
                {pr.is_baseline && <Text variant="label" style={styles.baseline}>lähtötaso</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Kisatuloskehitys */}
        {Object.entries(progressionByEvent).map(([event, results]) => {
          const latest = results[results.length - 1];
          const baseline = results[0];
          const improved = latest && baseline && latest.competition_date !== baseline.competition_date
            ? baseline.result_time_ms - latest.result_time_ms
            : null;
          return (
            <View key={event} style={styles.card}>
              <View style={styles.eventHeader}>
                <Text variant="heading">{event}</Text>
                {improved != null && (
                  <Text variant="bodyStrong" color={improved > 0 ? color.good : color.risk}>
                    {improved > 0 ? "−" : "+"}{msToTimeString(Math.abs(improved))}
                  </Text>
                )}
              </View>
              {results.slice(-5).map((r: any) => (
                <View key={r.competition_date + r.result_time_ms} style={styles.resultRow}>
                  <Text variant="caption" style={styles.flex}>{r.competition_date}</Text>
                  <Text variant="mono">{msToTimeString(r.result_time_ms)}</Text>
                  {r.improvement_pct != null && r.improvement_pct > 0 && (
                    <Text variant="label" color={color.good} style={styles.resultImprovement}>−{r.improvement_pct}%</Text>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  scrollContent: { paddingBottom: space.xxxl },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: color.bg },
  flex: { flex: 1 },

  header: {
    backgroundColor: color.surface,
    paddingTop: 56,
    paddingBottom: space.lg,
    paddingHorizontal: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.border,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, marginBottom: space.sm, marginLeft: -4 },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: space.sm },
  nameWrap: { flex: 1, gap: 2 },

  body: { padding: space.lg, gap: space.md },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.border,
    padding: space.lg,
    ...shadow.card,
  },
  cardTitle: { marginBottom: space.md },

  // Goal rows
  goalRow: { marginBottom: space.md },
  goalRowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: space.xs },
  barTrack: { height: 6, backgroundColor: color.bg, borderRadius: radius.pill, overflow: "hidden" },
  barFill: { height: 6, borderRadius: radius.pill },

  // Race goal
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

  // Zone bar
  zoneBarRow: { flexDirection: "row", height: 10, borderRadius: radius.pill, overflow: "hidden", marginBottom: space.md, gap: 1.5 },
  zoneSegment: { height: 10 },
  zoneLegend: { flexDirection: "row", justifyContent: "space-between" },
  zoneLegendItem: { flexDirection: "row", alignItems: "center", gap: space.xs },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  zonePct: { fontFamily: fontFamily.semibold, color: color.ink },

  // PRs
  prRow: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingVertical: space.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  baseline: { color: color.inkFaint },

  // Competition results
  eventHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.md },
  resultRow: { flexDirection: "row", alignItems: "center", gap: space.sm, paddingVertical: space.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  resultImprovement: { marginLeft: space.xs },
});
