import { View, ScrollView, StyleSheet, type DimensionValue } from "react-native";
import { Text } from "@/components/ui/Text";
import { Header } from "@/components/ui/Header";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { msToTimeString } from "@/lib/utils/time";
import { km, goalPct, tehoScore, trackStatus, type SwimmerSummary, type TrackTone } from "@/features/swimmer/swimmer-card.lib";
import { swimmerInsights, type InsightTone } from "@/features/swimmer/swimmer-insights.lib";
import {
  actualZones,
  goalForYear,
  groupProgression,
  raceLines,
  targetZones,
  type ProgressionRow,
  type SwimmerProfile,
  type ZoneRecord,
} from "@/features/swimmer/swimmer-detail.lib";
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

  const currentKm = km(summary?.total_pool_m ?? 0);
  const targetKm = goal?.target_pool_km ?? 0;
  const hasVolumeGoal = targetKm > 0;
  const pct = summary ? goalPct(summary) : 0;
  const expected = Math.round(seasonProgress * 100);

  const track = summary ? trackStatus(summary, seasonProgress) : null;
  const insights = swimmerInsights(summary, seasonProgress);

  const workouts = summary?.total_workouts ?? 0;
  const targetWorkouts = goal?.target_workouts ?? 0;
  const teho = summary ? tehoScore(summary) : null;
  const hasZoneData = (summary?.total_pool_m ?? 0) > 0;

  const races = raceLines(profile.personal_records ?? [], goal, groupProgression(progression));

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
            <SectionHeader>Mitä seuraavaksi</SectionHeader>
            {insights.map((it, i) => (
              <View key={i} style={styles.insightRow}>
                <View style={[styles.insightDot, { backgroundColor: TONE_COLOR[it.tone] }]} />
                <Text variant="body" style={styles.flex}>{it.text}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Harjoittelu — frequency, plan adherence, zone split */}
        <Card>
          <SectionHeader>Harjoittelu</SectionHeader>
          <View style={styles.statRow}>
            <Stat label="Harjoitukset" value={targetWorkouts > 0 ? `${workouts} / ${targetWorkouts}` : String(workouts)} />
            <Stat label="Teho-osuvuus" value={teho == null ? "–" : `${teho} %`} />
          </View>
          {hasZoneData ? (
            <ZonePlan actual={actualZones(summary)} target={targetZones(goal)} />
          ) : (
            <Text variant="body" color={color.inkMuted}>Ei harjoitusdataa vielä.</Text>
          )}
        </Card>

        {/* Kilpailut — one line per event: goal · PR · season trend */}
        {races.length > 0 && (
          <Card>
            <SectionHeader>Kilpailut</SectionHeader>
            {races.map((r, i) => (
              <View key={r.key} style={[styles.raceRow, i < races.length - 1 && styles.raceRowBorder]}>
                <View style={styles.flex}>
                  <View style={styles.raceTitleRow}>
                    <Text variant="bodyStrong">{r.label}</Text>
                    {r.isGoal && <Badge label="tavoite" tone="primary" />}
                  </View>
                  {(r.targetMs != null || r.improvedMs != null) && (
                    <Text variant="caption" color={color.inkMuted}>
                      {[
                        r.targetMs != null ? `tavoite ${msToTimeString(r.targetMs)}` : null,
                        r.improvedMs != null ? `kausi ${r.improvedMs > 0 ? "−" : "+"}${msToTimeString(Math.abs(r.improvedMs))}` : null,
                      ].filter(Boolean).join(" · ")}
                    </Text>
                  )}
                </View>
                <Text variant="mono" color={color.primaryInk}>{r.prMs != null ? msToTimeString(r.prMs) : "—"}</Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

/** The section-header tier: sentence-case, bold, with a hairline rule for structure. */
function SectionHeader({ children }: { children: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="subtitle">{children}</Text>
      <View style={styles.sectionRule} />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="label">{label}</Text>
      <Text variant="statValue" style={styles.statValue}>{value}</Text>
    </View>
  );
}

/** The zone heat-ramp over a per-zone actual-vs-plan table (the diff is the per-swimmer signal). */
function ZonePlan({ actual, target }: { actual: ZoneRecord; target?: ZoneRecord }) {
  const total = ZONE_ORDER.reduce((s, z) => s + (actual[z] ?? 0), 0);
  return (
    <View>
      <View style={styles.zoneBarRow}>
        {ZONE_ORDER.map((z) => {
          const w = total > 0 ? (actual[z] ?? 0) / total * 100 : 0;
          return w > 0 ? <View key={z} style={[styles.zoneSegment, { flex: w, backgroundColor: ZONES[z].color }]} /> : null;
        })}
      </View>
      <View style={styles.zonePlan}>
        {ZONE_ORDER.map((z) => {
          const p = total > 0 ? Math.round((actual[z] ?? 0) / total * 100) : 0;
          const tgt = target?.[z];
          const diff = tgt != null ? p - tgt : null;
          const diffColor = diff == null ? color.inkFaint : Math.abs(diff) <= 3 ? color.good : diff < 0 ? color.risk : color.warn;
          return (
            <View key={z} style={styles.zonePlanRow}>
              <View style={[styles.zoneDot, { backgroundColor: ZONES[z].color }]} />
              <Text variant="caption" color={color.ink} style={styles.zonePlanLabel}>{ZONES[z].label}</Text>
              <Text variant="bodyStrong" style={styles.zonePlanActual}>{p}%</Text>
              <Text variant="caption" color={color.inkMuted} style={styles.zonePlanTarget}>
                {tgt != null ? `tavoite ${tgt}%` : ""}
              </Text>
              {diff != null && (
                <Text variant="label" color={diffColor} style={styles.zonePlanDiff}>{diff > 0 ? "+" : ""}{diff}</Text>
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
  sectionHeader: { marginBottom: space.md },
  sectionRule: { height: StyleSheet.hairlineWidth, backgroundColor: color.border, marginTop: space.sm },

  heroRow: { flexDirection: "row", alignItems: "baseline", gap: space.xs, marginTop: space.xs },
  heroUnit: { transform: [{ translateY: -2 }] },
  paceTrack: { height: 8, backgroundColor: color.bg, borderRadius: radius.pill, overflow: "hidden", marginTop: space.md, marginBottom: space.sm, position: "relative" },
  paceFill: { height: 8, borderRadius: radius.pill },
  paceMarker: { position: "absolute", top: -2, width: 2, height: 12, backgroundColor: color.ink, borderRadius: 1 },

  insightRow: { flexDirection: "row", alignItems: "flex-start", gap: space.sm, paddingVertical: space.xs + 1 },
  insightDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },

  statRow: { flexDirection: "row", gap: space.lg, marginBottom: space.lg },
  stat: { flex: 1, gap: 2 },
  statValue: { marginTop: 2 },

  zoneBarRow: { flexDirection: "row", height: 10, borderRadius: radius.pill, overflow: "hidden", marginBottom: space.md, gap: 1.5 },
  zoneSegment: { height: 10 },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  zonePlan: { gap: space.xs + 2 },
  zonePlanRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  zonePlanLabel: { width: 34, color: color.ink, fontFamily: fontFamily.semibold },
  zonePlanActual: { width: 44 },
  zonePlanTarget: { flex: 1 },
  zonePlanDiff: { width: 28, textAlign: "right" },

  raceRow: { flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md },
  raceRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  raceTitleRow: { flexDirection: "row", alignItems: "center", gap: space.sm, marginBottom: 2 },
});
