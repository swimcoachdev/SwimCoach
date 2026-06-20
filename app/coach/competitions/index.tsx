import { View, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Plus, Trophy } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenState } from "@/components/ui/ScreenState";
import { useCoachContext } from "@/hooks/useCoachContext";
import { useClubCompetitions } from "@/lib/queries/competitions";
import { groupByYear } from "@/features/competition/competitions.lib";
import { CompetitionCard } from "@/features/competition/CompetitionCard";
import { color, space } from "@/constants/theme";

export default function CompetitionsScreen() {
  const router = useRouter();
  const { clubId } = useCoachContext();

  const competitionsQ = useClubCompetitions(clubId ?? undefined);

  return (
    <Screen>
      <Header
        title="Kilpailut"
        right={
          <Button
            label="Uusi kisa"
            variant="secondary"
            icon={<Plus size={16} color={color.primary} strokeWidth={2.5} />}
            onPress={() => router.push("/coach/competitions/new")}
          />
        }
      />

      <ScreenState query={competitionsQ}>
        {(competitions) => (
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={competitionsQ.isRefetching}
                onRefresh={() => competitionsQ.refetch()}
                tintColor={color.primary}
              />
            }
          >
            {competitions.length === 0 ? (
              <EmptyState icon={Trophy} text={"Ei kilpailuja vielä.\nLisää ensimmäinen kisa."} />
            ) : (
              groupByYear(competitions).map(({ year, competitions: comps }) => (
                <View key={year} style={s.yearGroup}>
                  <Text variant="label" style={s.yearLabel}>{year}</Text>
                  {comps.map((c) => (
                    <CompetitionCard
                      key={c.id}
                      competition={c}
                      onPress={() => router.push(`/coach/competitions/${c.id}`)}
                    />
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        )}
      </ScreenState>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: space.lg },
  yearGroup: { marginBottom: space.lg },
  yearLabel: { marginBottom: space.sm, marginLeft: space.xs },
});
