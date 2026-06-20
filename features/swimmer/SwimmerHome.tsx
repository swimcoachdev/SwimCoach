import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, type DimensionValue,
} from "react-native";
import { msToTimeString } from "@/lib/utils/time";
import { calcZoneDistribution } from "@/lib/utils/zones";
import { STROKES } from "@/constants/strokes";
import type { IntensityZone } from "@/constants/zones";
import { goalForYear, type ProgressionRow, type SwimmerProfile } from "@/features/swimmer/swimmer-detail.lib";
import { recentSets, recentVolume, type RecentWorkout } from "@/features/swimmer/swimmer-dashboard.lib";

const ZONES: Record<IntensityZone, { color: string; label: string }> = {
  pk:  { color: "#3B82F6", label: "PK" },
  vk:  { color: "#22C55E", label: "VK" },
  mk:  { color: "#EAB308", label: "MK" },
  mak: { color: "#EF4444", label: "MAK" },
};

type Tab = "kehitys" | "harjoitukset" | "kisat";

interface Props {
  profile: SwimmerProfile;
  progression: ProgressionRow[];
  recentWorkouts: RecentWorkout[];
  year: number;
  refreshing: boolean;
  onRefresh: () => void;
  onSignOut: () => void;
}

export function SwimmerHome({ profile, progression, recentWorkouts, year, refreshing, onRefresh, onSignOut }: Props) {
  const [tab, setTab] = useState<Tab>("kehitys");

  const goal = goalForYear(profile, year);
  const prs = profile.personal_records ?? [];
  const zoneDist = calcZoneDistribution(recentSets(recentWorkouts));
  const { totalKm } = recentVolume(recentWorkouts);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View>
          <Text style={s.headerName}>{profile.full_name}</Text>
          <Text style={s.headerSub}>Kausi {year}</Text>
        </View>
        <TouchableOpacity onPress={onSignOut} style={s.logoutBtn}>
          <Text style={s.logoutText}>Kirjaudu ulos</Text>
        </TouchableOpacity>
        {goal?.target_stroke && (
          <View style={s.goalBadge}>
            <Text style={s.goalBadgeLabel}>Tavoite</Text>
            <Text style={s.goalBadgeValue}>
              {goal.target_distance}m {STROKES[goal.target_stroke as keyof typeof STROKES]?.short ?? goal.target_stroke}
              {goal.target_time_ms ? "  " + msToTimeString(goal.target_time_ms) : ""}
            </Text>
          </View>
        )}
      </View>

      <View style={s.tabBar}>
        {(["kehitys", "harjoitukset", "kisat"] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={s.tabItem} onPress={() => setTab(t)}>
            <Text style={[s.tabLabel, tab === t && s.tabLabelActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
            {tab === t && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {tab === "kehitys" && (
          <>
            <View style={s.card}>
              <Text style={s.cardTitle}>Uintimetrit kaudella</Text>
              <Text style={s.bigNumber}>{totalKm} <Text style={s.bigUnit}>km</Text></Text>
              {goal?.target_pool_km ? (
                <>
                  <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: `${Math.min(100, totalKm / goal.target_pool_km * 100)}%` as DimensionValue, backgroundColor: "#0EA5E9" }]} />
                  </View>
                  <Text style={s.progressLabel}>{Math.round(totalKm / goal.target_pool_km * 100)}% tavoitteesta ({goal.target_pool_km} km)</Text>
                </>
              ) : null}
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Tehoaluejakauma</Text>
              {zoneDist.total > 0 ? (
                <>
                  <View style={s.zoneBar}>
                    {(["pk", "vk", "mk", "mak"] as IntensityZone[]).map((z) => {
                      const pct = zoneDist[z] / zoneDist.total;
                      return pct > 0 ? (
                        <View key={z} style={{ flex: pct, backgroundColor: ZONES[z].color, height: 12 }} />
                      ) : null;
                    })}
                  </View>
                  <View style={s.zoneLegend}>
                    {(["pk", "vk", "mk", "mak"] as IntensityZone[]).map((z) => (
                      <View key={z} style={s.zoneLegendItem}>
                        <View style={[s.zoneDot, { backgroundColor: ZONES[z].color }]} />
                        <Text style={s.zoneLegendText}>{ZONES[z].label} {Math.round(zoneDist[z] / zoneDist.total * 100)}%</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={s.empty}>Ei vielä harjoitusdataa</Text>
              )}
            </View>

            {goal?.target_workouts ? (
              <View style={s.card}>
                <Text style={s.cardTitle}>Harjoituskerrat</Text>
                <Text style={s.bigNumber}>{recentWorkouts.length} <Text style={s.bigUnit}>/ {goal.target_workouts}</Text></Text>
                <View style={s.progressBg}>
                  <View style={[s.progressFill, { width: `${Math.min(100, recentWorkouts.length / goal.target_workouts * 100)}%` as DimensionValue, backgroundColor: "#22C55E" }]} />
                </View>
              </View>
            ) : null}
          </>
        )}

        {tab === "harjoitukset" && (
          <View style={s.card}>
            {recentWorkouts.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>🏊</Text>
                <Text style={s.empty}>Ei harjoituksia vielä</Text>
              </View>
            ) : (
              recentWorkouts.map((w, i) => (
                <View key={w.recorded_at + i} style={[s.workoutRow, i < recentWorkouts.length - 1 && s.workoutRowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.workoutDate}>{w.workouts?.workout_date ?? "—"}</Text>
                  </View>
                  <Text style={s.workoutDist}>{w.actual_pool_m != null ? `${w.actual_pool_m}m` : "—"}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {tab === "kisat" && (
          <>
            {prs.length > 0 && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Henkilökohtaiset ennätykset</Text>
                {prs.map((pr, i) => (
                  <View key={pr.id} style={[s.prRow, i < prs.length - 1 && s.workoutRowBorder]}>
                    <Text style={s.prLabel}>{pr.distance}m {STROKES[pr.stroke as keyof typeof STROKES]?.label ?? pr.stroke}</Text>
                    <Text style={s.prTime}>{msToTimeString(pr.best_time_ms)}</Text>
                  </View>
                ))}
              </View>
            )}
            {prs.length === 0 && progression.length === 0 && (
              <View style={[s.card, s.emptyState]}>
                <Text style={s.emptyIcon}>🏆</Text>
                <Text style={s.empty}>Ei kisatuloksia vielä.{"\n"}Valmentaja lisää tulokset.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: "#f9fafb" },
  header:          { backgroundColor: "#fff", paddingTop: 56, paddingBottom: 12, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  headerName:      { fontSize: 20, fontWeight: "700", color: "#111827" },
  headerSub:       { fontSize: 13, color: "#9ca3af", marginTop: 2 },
  logoutBtn:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#e2e8f0" },
  logoutText:      { fontSize: 12, color: "#94a3b8", fontWeight: "500" },
  goalBadge:       { backgroundColor: "#eff6ff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, alignItems: "flex-end" },
  goalBadgeLabel:  { fontSize: 11, color: "#93c5fd" },
  goalBadgeValue:  { fontSize: 13, fontWeight: "700", color: "#2563eb" },
  tabBar:          { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tabItem:         { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabLabel:        { fontSize: 13, fontWeight: "500", color: "#9ca3af" },
  tabLabelActive:  { color: "#0EA5E9" },
  tabUnderline:    { position: "absolute", bottom: 0, left: 16, right: 16, height: 2, backgroundColor: "#0EA5E9", borderRadius: 2 },
  scroll:          { flex: 1 },
  card:            { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTitle:       { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 12 },
  bigNumber:       { fontSize: 36, fontWeight: "700", color: "#111827", marginBottom: 8 },
  bigUnit:         { fontSize: 20, fontWeight: "400", color: "#9ca3af" },
  progressBg:      { height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden", marginBottom: 4 },
  progressFill:    { height: 8, borderRadius: 4 },
  progressLabel:   { fontSize: 12, color: "#9ca3af" },
  zoneBar:         { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 10 },
  zoneLegend:      { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  zoneLegendItem:  { flexDirection: "row", alignItems: "center", gap: 4 },
  zoneDot:         { width: 8, height: 8, borderRadius: 4 },
  zoneLegendText:  { fontSize: 12, color: "#6b7280" },
  workoutRow:      { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  workoutRowBorder:{ borderBottomWidth: 1, borderBottomColor: "#f9fafb" },
  workoutDate:     { fontSize: 14, color: "#374151" },
  workoutDist:     { fontSize: 14, fontWeight: "600", color: "#0EA5E9" },
  prRow:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  prLabel:         { fontSize: 14, color: "#374151" },
  prTime:          { fontSize: 15, fontWeight: "700", color: "#0EA5E9" },
  emptyState:      { alignItems: "center", paddingVertical: 32 },
  emptyIcon:       { fontSize: 32, marginBottom: 8 },
  empty:           { fontSize: 13, color: "#9ca3af", textAlign: "center" },
});
