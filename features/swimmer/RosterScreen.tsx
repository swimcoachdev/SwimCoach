import { ScrollView, View, RefreshControl, TouchableOpacity, StyleSheet } from "react-native";
import { Plus, Waves } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { Header } from "@/components/ui/Header";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { SwimmerCard } from "@/features/swimmer/SwimmerCard";
import { RosterStats } from "@/features/swimmer/RosterStats";
import { LensTabs } from "@/features/swimmer/LensTabs";
import { type SwimmerSummary, type LensKey, rankSwimmers } from "@/features/swimmer/swimmer-card.lib";
import { rosterStats } from "@/features/swimmer/roster.lib";
import { color, space, radius, shadow } from "@/constants/theme";

interface Props {
  swimmers: SwimmerSummary[];
  groups: { id: string; name: string }[];
  lens: LensKey;
  onLens: (lens: LensKey) => void;
  selectedGroup: string | null;
  onSelectGroup: (id: string | null) => void;
  seasonProgress: number;
  refreshing: boolean;
  onRefresh: () => void;
  onSignOut: () => void;
  onOpenSwimmer: (id: string) => void;
  onNewWorkout: () => void;
}

/** The coach roster: ranked, lens-driven swimmer grid with its header and FAB. */
export function RosterScreen({
  swimmers, groups, lens, onLens, selectedGroup, onSelectGroup,
  seasonProgress, refreshing, onRefresh, onSignOut, onOpenSwimmer, onNewWorkout,
}: Props) {
  const ranked = rankSwimmers(lens, swimmers);
  const stats = rosterStats(ranked);

  return (
    <View style={s.root}>
      <Header title="Uimarit" right={<Chip label="Kirjaudu ulos" onPress={onSignOut} />}>
        <View style={s.headerBody}>
          <RosterStats totalKm={stats.totalKm} avgGoalPct={stats.avgGoalPct} count={stats.count} />

          {groups.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.filterRow}>
                <Chip label="Kaikki" active={!selectedGroup} onPress={() => onSelectGroup(null)} />
                {groups.map((g) => (
                  <Chip key={g.id} label={g.name} active={selectedGroup === g.id} onPress={() => onSelectGroup(g.id)} />
                ))}
              </View>
            </ScrollView>
          )}

          <LensTabs value={lens} onChange={onLens} />
        </View>
      </Header>

      <ScrollView
        style={s.list}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.primary} />}
      >
        {ranked.length === 0 ? (
          <EmptyState icon={Waves} text={"Ei uimareita vielä.\nLisää uimareita seuran hallinnasta."} />
        ) : (
          <View style={s.grid}>
            {ranked.map((sw, i) => (
              <SwimmerCard
                key={sw.swimmer_id}
                swimmer={sw}
                lens={lens}
                rank={i + 1}
                seasonProgress={seasonProgress}
                onPress={() => onOpenSwimmer(sw.swimmer_id)}
              />
            ))}
          </View>
        )}
        <View style={s.bottomSpacer} />
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={onNewWorkout}>
        <Plus size={18} color={color.onPrimary} strokeWidth={2.5} />
        <Text variant="bodyStrong" color={color.onPrimary}>Harjoitus</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  headerBody: { gap: space.md, paddingHorizontal: space.lg, paddingBottom: space.xs },
  filterRow: { flexDirection: "row", gap: space.sm },
  list: { flex: 1 },
  listContent: { padding: space.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: space.md },
  bottomSpacer: { height: 96 },
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
