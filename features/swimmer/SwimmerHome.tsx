import { useState } from "react";
import {
  View, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, type DimensionValue,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Waves, Trophy } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { color, space, radius, shadow } from "@/constants/theme";
import { msToTimeString } from "@/lib/utils/time";
import { calcZoneDistribution } from "@/lib/utils/zones";
import { STROKES } from "@/constants/strokes";
import { ZONES, type IntensityZone } from "@/constants/zones";
import { goalForYear, type ProgressionRow, type SwimmerProfile } from "@/features/swimmer/swimmer-detail.lib";
import { recentSets, recentVolume, type RecentWorkout } from "@/features/swimmer/swimmer-dashboard.lib";

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
  const insets = useSafeAreaInsets();

  const goal = goalForYear(profile, year);
  const prs = profile.personal_records ?? [];
  const zoneDist = calcZoneDistribution(recentSets(recentWorkouts));
  const { totalKm } = recentVolume(recentWorkouts);

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: insets.top + space.sm }]}>
        <View>
          <Text variant="title" style={s.headerName}>{profile.full_name}</Text>
          <Text variant="caption" color={color.inkFaint} style={s.headerSub}>Kausi {year}</Text>
        </View>
        <TouchableOpacity onPress={onSignOut} style={s.logoutBtn}>
          <Text variant="caption" color={color.inkFaint}>Kirjaudu ulos</Text>
        </TouchableOpacity>
        {goal?.target_stroke && (
          <View style={s.goalBadge}>
            <Text variant="label" color={color.primary}>Tavoite</Text>
            <Text variant="bodyStrong" color={color.primaryInk} style={s.goalBadgeValue}>
              {goal.target_distance}m {STROKES[goal.target_stroke as keyof typeof STROKES]?.short ?? goal.target_stroke}
              {goal.target_time_ms ? "  " + msToTimeString(goal.target_time_ms) : ""}
            </Text>
          </View>
        )}
      </View>

      <View style={s.tabBar}>
        {(["kehitys", "harjoitukset", "kisat"] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={s.tabItem} onPress={() => setTab(t)}>
            <Text variant="bodyStrong" color={tab === t ? color.primary : color.inkFaint}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
            {tab === t && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ padding: space.lg, paddingBottom: space.huge }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {tab === "kehitys" && (
          <>
            <View style={s.card}>
              <Text variant="heading" color={color.inkMuted} style={s.cardTitle}>Uintimetrit kaudella</Text>
              <Text variant="display" style={s.bigNumber}>{totalKm} <Text variant="title" color={color.inkFaint}>km</Text></Text>
              {goal?.target_pool_km ? (
                <>
                  <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: `${Math.min(100, totalKm / goal.target_pool_km * 100)}%` as DimensionValue, backgroundColor: color.primary }]} />
                  </View>
                  <Text variant="caption" color={color.inkFaint}>{Math.round(totalKm / goal.target_pool_km * 100)}% tavoitteesta ({goal.target_pool_km} km)</Text>
                </>
              ) : null}
            </View>

            <View style={s.card}>
              <Text variant="heading" color={color.inkMuted} style={s.cardTitle}>Tehoaluejakauma</Text>
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
                        <Text variant="caption" color={color.inkMuted}>{ZONES[z].label} {Math.round(zoneDist[z] / zoneDist.total * 100)}%</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <Text variant="caption" color={color.inkFaint} style={s.empty}>Ei vielä harjoitusdataa</Text>
              )}
            </View>

            {goal?.target_workouts ? (
              <View style={s.card}>
                <Text variant="heading" color={color.inkMuted} style={s.cardTitle}>Harjoituskerrat</Text>
                <Text variant="display" style={s.bigNumber}>{recentWorkouts.length} <Text variant="title" color={color.inkFaint}>/ {goal.target_workouts}</Text></Text>
                <View style={s.progressBg}>
                  <View style={[s.progressFill, { width: `${Math.min(100, recentWorkouts.length / goal.target_workouts * 100)}%` as DimensionValue, backgroundColor: color.good }]} />
                </View>
              </View>
            ) : null}
          </>
        )}

        {tab === "harjoitukset" && (
          <View style={s.card}>
            {recentWorkouts.length === 0 ? (
              <View style={s.emptyState}>
                <Waves size={32} color={color.inkFaint} style={s.emptyIcon} />
                <Text variant="caption" color={color.inkFaint} style={s.empty}>Ei harjoituksia vielä</Text>
              </View>
            ) : (
              recentWorkouts.map((w, i) => (
                <View key={w.recorded_at + i} style={[s.workoutRow, i < recentWorkouts.length - 1 && s.workoutRowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" color={color.inkMuted}>{w.workouts?.workout_date ?? "—"}</Text>
                  </View>
                  <Text variant="bodyStrong" color={color.primary}>{w.actual_pool_m != null ? `${w.actual_pool_m}m` : "—"}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {tab === "kisat" && (
          <>
            {prs.length > 0 && (
              <View style={s.card}>
                <Text variant="heading" color={color.inkMuted} style={s.cardTitle}>Henkilökohtaiset ennätykset</Text>
                {prs.map((pr, i) => (
                  <View key={pr.id} style={[s.prRow, i < prs.length - 1 && s.workoutRowBorder]}>
                    <Text variant="body" color={color.inkMuted}>{pr.distance}m {STROKES[pr.stroke as keyof typeof STROKES]?.label ?? pr.stroke}</Text>
                    <Text variant="bodyStrong" color={color.primary}>{msToTimeString(pr.best_time_ms)}</Text>
                  </View>
                ))}
              </View>
            )}
            {prs.length === 0 && progression.length === 0 && (
              <View style={[s.card, s.emptyState]}>
                <Trophy size={32} color={color.inkFaint} style={s.emptyIcon} />
                <Text variant="caption" color={color.inkFaint} style={s.empty}>Ei kisatuloksia vielä.{"\n"}Valmentaja lisää tulokset.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex: 1, backgroundColor: color.bg },
  header:          { backgroundColor: color.surface, paddingBottom: space.md, paddingHorizontal: space.xl, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  headerName:      {},
  headerSub:       { marginTop: 2 },
  logoutBtn:       { paddingHorizontal: space.md, paddingVertical: space.xs + 2, borderRadius: radius.xl, borderWidth: 1, borderColor: color.border },
  goalBadge:       { backgroundColor: color.primaryWash, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm, alignItems: "flex-end" },
  goalBadgeValue:  {},
  tabBar:          { flexDirection: "row", backgroundColor: color.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  tabItem:         { flex: 1, alignItems: "center", paddingVertical: space.md },
  tabUnderline:    { position: "absolute", bottom: 0, left: space.lg, right: space.lg, height: 2, backgroundColor: color.primary, borderRadius: 2 },
  scroll:          { flex: 1 },
  card:            { backgroundColor: color.surface, borderRadius: radius.lg, padding: space.lg, marginBottom: space.md, ...shadow.card },
  cardTitle:       { marginBottom: space.md },
  bigNumber:       { marginBottom: space.sm },
  progressBg:      { height: 8, backgroundColor: color.border, borderRadius: radius.sm / 2, overflow: "hidden", marginBottom: space.xs },
  progressFill:    { height: 8, borderRadius: radius.sm / 2 },
  zoneBar:         { flexDirection: "row", height: 12, borderRadius: radius.sm - 2, overflow: "hidden", marginBottom: space.sm + 2 },
  zoneLegend:      { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  zoneLegendItem:  { flexDirection: "row", alignItems: "center", gap: space.xs },
  zoneDot:         { width: 8, height: 8, borderRadius: 4 },
  workoutRow:      { flexDirection: "row", alignItems: "center", paddingVertical: space.md },
  workoutRowBorder:{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color.border },
  prRow:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: space.md },
  emptyState:      { alignItems: "center", paddingVertical: space.xxxl },
  emptyIcon:       { marginBottom: space.sm },
  empty:           { textAlign: "center" },
});
