import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCoachContext } from "@/hooks/useCoachContext";
import { useClubCompetitions } from "@/lib/queries/competitions";
import { groupByYear } from "@/features/competition/competitions.lib";
import { CompetitionCard } from "@/features/competition/CompetitionCard";

const BRAND = "#0EA5E9";

export default function CompetitionsScreen() {
  const router = useRouter();
  const { clubId } = useCoachContext();

  const competitionsQ = useClubCompetitions(clubId ?? undefined);
  const competitions = competitionsQ.data ?? [];
  const years = groupByYear(competitions);

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Text style={s.title}>Kilpailut</Text>
        <TouchableOpacity style={s.newBtn} onPress={() => router.push("/coach/competitions/new")}>
          <Text style={s.newBtnText}>+ Uusi kisa</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl refreshing={competitionsQ.isRefetching} onRefresh={() => competitionsQ.refetch()} />
        }
      >
        {competitions.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🏆</Text>
            <Text style={s.emptyText}>Ei kilpailuja vielä.{"\n"}Lisää ensimmäinen kisa.</Text>
          </View>
        ) : (
          years.map(({ year, competitions: comps }) => (
            <View key={year} style={s.yearGroup}>
              <Text style={s.yearLabel}>{year}</Text>
              {comps.map((c) => (
                <CompetitionCard key={c.id} competition={c} onPress={() => router.push(`/coach/competitions/${c.id}`)} />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { backgroundColor: "#fff", paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  title: { fontSize: 22, fontWeight: "700", color: "#0F172A" },
  newBtn: { backgroundColor: BRAND, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  newBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  empty: { alignItems: "center", paddingTop: 64 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: "#94A3B8", textAlign: "center", lineHeight: 22 },
  yearGroup: { marginBottom: 16 },
  yearLabel: { fontSize: 11, fontWeight: "700", color: "#94A3B8", marginBottom: 8, marginLeft: 4 },
});
