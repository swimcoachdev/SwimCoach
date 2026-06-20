import { ScrollView, View, RefreshControl, TouchableOpacity, StyleSheet } from "react-native";
import { Plus, Waves, LayoutGrid, List } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { Header } from "@/components/ui/Header";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { SwimmerCard } from "@/features/swimmer/SwimmerCard";
import { SwimmerListRow } from "@/features/swimmer/SwimmerListRow";
import { LensTabs } from "@/features/swimmer/LensTabs";
import { type SwimmerSummary, type LensKey, rankSwimmers } from "@/features/swimmer/swimmer-card.lib";
import { filterRoster } from "@/features/swimmer/roster.lib";
import { color, space, radius, shadow } from "@/constants/theme";

export type RosterDensity = "cards" | "list";

interface Props {
  swimmers: SwimmerSummary[];
  groups: { id: string; name: string }[];
  lens: LensKey;
  onLens: (lens: LensKey) => void;
  selectedGroup: string | null;
  onSelectGroup: (id: string | null) => void;
  search: string;
  onSearch: (q: string) => void;
  density: RosterDensity;
  onDensity: (d: RosterDensity) => void;
  seasonProgress: number;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenSwimmer: (id: string) => void;
  onNewWorkout: () => void;
}

/**
 * Koti — the coach's roster landing. The lens ranks the swimmers (who's lagging
 * sorts to the ends), so the list itself is the read on who needs a look; the
 * swimmer count and the card/list density toggle sit with the list. One roster
 * carrying both densities + a name search, so the old separate "Uimarit" tab
 * folds in here. (An explicit "needs attention" surface is a later deliverable.)
 */
export function RosterScreen({
  swimmers, groups, lens, onLens, selectedGroup, onSelectGroup,
  search, onSearch, density, onDensity,
  seasonProgress, refreshing, onRefresh, onOpenSwimmer, onNewWorkout,
}: Props) {
  const ranked = rankSwimmers(lens, swimmers);
  const visible = filterRoster(ranked, search);
  const searching = search.trim().length > 0;

  return (
    <View style={s.root}>
      <Header title="SwimCoach">
        <View style={s.headerBody}>
          <Field placeholder="Hae nimellä…" value={search} onChangeText={onSearch} />

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
        {visible.length === 0 ? (
          <EmptyState
            icon={Waves}
            text={searching ? "Ei osumia haulle." : "Ei uimareita vielä.\nLisää uimareita seuran hallinnasta."}
          />
        ) : (
          <>
            <View style={s.listHead}>
              <Text variant="label">{visible.length} {visible.length === 1 ? "uimari" : "uimaria"}</Text>
              <DensityToggle value={density} onChange={onDensity} />
            </View>

            {density === "list" ? (
              <View>
                {visible.map((sw) => (
                  <SwimmerListRow key={sw.swimmer_id} swimmer={sw} onPress={() => onOpenSwimmer(sw.swimmer_id)} />
                ))}
              </View>
            ) : (
              <View style={s.grid}>
                {visible.map((sw, i) => (
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
          </>
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

function DensityToggle({ value, onChange }: { value: RosterDensity; onChange: (d: RosterDensity) => void }) {
  return (
    <View style={s.densityWrap}>
      {([
        { key: "cards", Icon: LayoutGrid },
        { key: "list", Icon: List },
      ] as const).map(({ key, Icon }) => (
        <TouchableOpacity
          key={key}
          onPress={() => onChange(key)}
          style={[s.densityBtn, value === key && s.densityBtnActive]}
        >
          <Icon size={16} color={value === key ? color.onPrimary : color.inkMuted} strokeWidth={2.2} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  headerBody: { gap: space.md, paddingHorizontal: space.lg, paddingBottom: space.xs },
  filterRow: { flexDirection: "row", gap: space.sm },
  list: { flex: 1 },
  listContent: { padding: space.lg },
  listHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: space.md },
  densityWrap: { flexDirection: "row", gap: 2, backgroundColor: color.bg, borderRadius: radius.pill, padding: 2 },
  densityBtn: { paddingHorizontal: space.sm, paddingVertical: space.xs + 1, borderRadius: radius.pill },
  densityBtnActive: { backgroundColor: color.ink },
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
