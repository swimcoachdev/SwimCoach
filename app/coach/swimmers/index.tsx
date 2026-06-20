import { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Users } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { Field } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenState } from "@/components/ui/ScreenState";
import { useCoachContext } from "@/hooks/useCoachContext";
import { useSeasonSummary } from "@/lib/queries/swimmers";
import { SwimmerListRow } from "@/features/swimmer/SwimmerListRow";
import { filterRoster } from "@/features/swimmer/roster.lib";
import { rankSwimmers, type LensKey } from "@/features/swimmer/swimmer-card.lib";
import { space } from "@/constants/theme";

type SortKey = "name" | "goal" | "workouts";

const SORT_LABELS: Record<SortKey, string> = {
  name: "A–Z",
  goal: "Tavoite %",
  workouts: "Harjoitukset",
};

export default function SwimmersListScreen() {
  const router = useRouter();
  const { clubId } = useCoachContext();
  const year = new Date().getFullYear();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name");

  const summaryQ = useSeasonSummary(clubId ?? undefined, year);

  return (
    <Screen>
      <Header title="Uimarit">
        <View style={s.headerBody}>
          <Field placeholder="Hae nimellä..." value={search} onChangeText={setSearch} />
          <View style={s.sortRow}>
            {(["name", "goal", "workouts"] as SortKey[]).map((k) => (
              <Chip key={k} label={SORT_LABELS[k]} active={sort === k} onPress={() => setSort(k)} />
            ))}
          </View>
        </View>
      </Header>

      <ScreenState query={summaryQ}>
        {(swimmers) => {
          const filtered = rankSwimmers(sort as LensKey, filterRoster(swimmers, search));
          if (filtered.length === 0) {
            return <EmptyState icon={Users} text="Ei uimareita." />;
          }
          return (
            <ScrollView style={s.list} contentContainerStyle={s.listContent}>
              {filtered.map((sw) => (
                <SwimmerListRow
                  key={sw.swimmer_id}
                  swimmer={sw}
                  onPress={() => router.push(`/coach/swimmers/${sw.swimmer_id}`)}
                />
              ))}
              <View style={s.bottomSpacer} />
            </ScrollView>
          );
        }}
      </ScreenState>
    </Screen>
  );
}

const s = StyleSheet.create({
  headerBody: { gap: space.md, paddingHorizontal: space.lg, paddingBottom: space.xs },
  sortRow: { flexDirection: "row", gap: space.sm },
  list: { flex: 1 },
  listContent: { padding: space.lg },
  bottomSpacer: { height: space.xxxl },
});
