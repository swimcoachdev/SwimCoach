import { useEffect, useState, useCallback } from "react";
import {
  View, ScrollView, TouchableOpacity, RefreshControl, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus, Waves } from "lucide-react-native";
import { SwimmerCard } from "@/components/swimmer/SwimmerCard";
import { Text } from "@/components/ui/Text";
import { PaceClock } from "@/components/ui/PaceClock";
import { useCoachContext } from "@/hooks/useCoachContext";
import { getSwimmerSeasonSummary } from "@/lib/queries/swimmers";
import { getClubGroups } from "@/lib/queries/groups";
import { supabase } from "@/lib/supabase";
import {
  type SwimmerSummary, type LensKey, LENSES, rankSwimmers, km,
} from "@/lib/swimmer-card.lib";
import { color, space, radius, shadow } from "@/constants/theme";

function seasonProgressNow(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1).getTime();
  const end = new Date(now.getFullYear(), 11, 31).getTime();
  return (now.getTime() - start) / (end - start);
}

export default function CoachDashboard() {
  const router = useRouter();
  const { clubId, ready } = useCoachContext();

  const [swimmers, setSwimmers] = useState<SwimmerSummary[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [lens, setLens] = useState<LensKey>("goal");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();
  const seasonProgress = seasonProgressNow();

  const load = useCallback(async () => {
    if (!clubId) return;
    const [sumRes, grpRes] = await Promise.all([
      getSwimmerSeasonSummary(clubId, year),
      getClubGroups(clubId),
    ]);
    if (sumRes.data) setSwimmers(sumRes.data as SwimmerSummary[]);
    if (grpRes.data) setGroups(grpRes.data);
    setLoading(false);
  }, [clubId, year]);

  useEffect(() => { if (ready) load(); }, [ready, load]);

  useEffect(() => {
    if (!clubId) return;
    const channel = supabase
      .channel("coach-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "workout_attendance" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [clubId, load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const ranked = rankSwimmers(lens, swimmers);

  const totalPoolKm = km(ranked.reduce((acc, x) => acc + (x.total_pool_m ?? 0), 0));
  const avgGoalPct = ranked.length > 0
    ? Math.round(ranked.reduce((acc, x) => {
        const pct = (x.target_pool_m ?? 0) > 0 ? (x.total_pool_m ?? 0) / (x.target_pool_m ?? 1) * 100 : 0;
        return acc + pct;
      }, 0) / ranked.length)
    : 0;

  if (loading) {
    return (
      <View style={s.center}>
        <PaceClock size={48} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text variant="title">Uimarit</Text>
          <TouchableOpacity onPress={() => supabase.auth.signOut()} style={s.logoutBtn}>
            <Text variant="caption" color={color.inkMuted}>Kirjaudu ulos</Text>
          </TouchableOpacity>
        </View>

        {/* Season stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text variant="label">Yhteensä uitu</Text>
            <Text variant="statValue" style={s.statValue}>{totalPoolKm}<Text variant="caption" color={color.inkFaint}> km</Text></Text>
          </View>
          <View style={s.statCard}>
            <Text variant="label">Tavoite keskim.</Text>
            <Text variant="statValue" style={s.statValue} color={color.primaryInk}>{avgGoalPct}<Text variant="caption" color={color.inkFaint}> %</Text></Text>
          </View>
          <View style={s.statCard}>
            <Text variant="label">Uimareita</Text>
            <Text variant="statValue" style={s.statValue}>{ranked.length}</Text>
          </View>
        </View>

        {/* Group filter */}
        {groups.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
            <View style={s.filterRow}>
              <Chip label="Kaikki" active={!selectedGroup} onPress={() => setSelectedGroup(null)} />
              {groups.map((g) => (
                <Chip key={g.id} label={g.name} active={selectedGroup === g.id} onPress={() => setSelectedGroup(g.id)} />
              ))}
            </View>
          </ScrollView>
        )}

        {/* Lens — what to rank and headline by */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.lensRow}>
            {LENSES.map((l) => (
              <TouchableOpacity
                key={l.key}
                onPress={() => setLens(l.key)}
                style={[s.lensChip, lens === l.key && s.lensChipActive]}
              >
                <Text variant="caption" color={lens === l.key ? color.onPrimary : color.inkMuted}>
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Roster */}
      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.primary} />}
      >
        {ranked.length === 0 ? (
          <View style={s.empty}>
            <Waves size={40} color={color.inkFaint} strokeWidth={1.5} />
            <Text variant="body" color={color.inkMuted} style={s.emptyText}>
              Ei uimareita vielä.{"\n"}Lisää uimareita seuran hallinnasta.
            </Text>
          </View>
        ) : (
          <View style={s.grid}>
            {ranked.map((sw, i) => (
              <SwimmerCard
                key={sw.swimmer_id}
                swimmer={sw}
                lens={lens}
                rank={i + 1}
                seasonProgress={seasonProgress}
                onPress={() => router.push(`/coach/swimmers/${sw.swimmer_id}`)}
              />
            ))}
          </View>
        )}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* New workout */}
      <TouchableOpacity style={s.fab} onPress={() => router.push("/coach/workout/new")}>
        <Plus size={18} color={color.onPrimary} strokeWidth={2.5} />
        <Text variant="bodyStrong" color={color.onPrimary}>Harjoitus</Text>
      </TouchableOpacity>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[s.filterChip, active && s.filterChipActive]}>
      <Text variant="caption" color={active ? color.onPrimary : color.inkMuted}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: color.bg },
  header: {
    backgroundColor: color.surface,
    paddingTop: 56,
    paddingBottom: space.md,
    paddingHorizontal: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.border,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.lg },
  logoutBtn: { paddingHorizontal: space.md, paddingVertical: space.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: color.border },
  statsRow: { flexDirection: "row", gap: space.sm, marginBottom: space.md },
  statCard: { flex: 1, borderRadius: radius.md, padding: space.md, backgroundColor: color.surfaceAlt, borderWidth: StyleSheet.hairlineWidth, borderColor: color.border },
  statValue: { marginTop: 2 },
  filterScroll: { marginBottom: space.sm },
  filterRow: { flexDirection: "row", gap: space.sm },
  filterChip: { paddingHorizontal: space.md, paddingVertical: space.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: color.border, backgroundColor: color.surface },
  filterChipActive: { backgroundColor: color.primary, borderColor: color.primary },
  lensRow: { flexDirection: "row", gap: space.sm },
  lensChip: { paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, backgroundColor: color.bg },
  lensChipActive: { backgroundColor: color.ink },
  list: { flex: 1 },
  listContent: { padding: space.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  empty: { alignItems: "center", paddingVertical: 64, gap: space.md },
  emptyText: { textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: space.xxl,
    right: space.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    backgroundColor: color.primary,
    borderRadius: radius.lg,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    ...shadow.fab,
  },
});
