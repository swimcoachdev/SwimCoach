import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useCoachContext } from "@/hooks/useCoachContext";
import { useSeasonSummary } from "@/lib/queries/swimmers";
import { SwimmerListRow } from "@/features/swimmer/SwimmerListRow";
import { filterRoster } from "@/features/swimmer/roster.lib";
import { rankSwimmers, type LensKey } from "@/features/swimmer/swimmer-card.lib";

type SortKey = "name" | "goal" | "workouts";

export default function SwimmersListScreen() {
  const router = useRouter();
  const { clubId } = useCoachContext();
  const year = new Date().getFullYear();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name");

  const summaryQ = useSeasonSummary(clubId ?? undefined, year);
  const filtered = rankSwimmers(sort as LensKey, filterRoster(summaryQ.data ?? [], search));

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Text style={s.title}>Uimarit</Text>
        <TextInput
          style={s.search}
          placeholder="Hae nimellä..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        <View style={s.sortRow}>
          {(["name", "goal", "workouts"] as SortKey[]).map((k) => (
            <TouchableOpacity key={k} style={[s.sortBtn, sort === k && s.sortBtnActive]} onPress={() => setSort(k)}>
              <Text style={[s.sortText, sort === k && s.sortTextActive]}>
                {k === "name" ? "A–Z" : k === "goal" ? "Tavoite %" : "Harjoitukset"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={s.list} contentContainerStyle={s.listContent}>
        {filtered.map((sw) => (
          <SwimmerListRow key={sw.swimmer_id} swimmer={sw} onPress={() => router.push(`/coach/swimmers/${sw.swimmer_id}`)} />
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { backgroundColor: "#fff", paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  title: { fontSize: 22, fontWeight: "700", color: "#0F172A", marginBottom: 10 },
  search: { backgroundColor: "#F1F5F9", borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14, color: "#0F172A", marginBottom: 10 },
  sortRow: { flexDirection: "row", gap: 8 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#F1F5F9" },
  sortBtnActive: { backgroundColor: "#0F172A" },
  sortText: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  sortTextActive: { color: "#fff" },
  list: { flex: 1 },
  listContent: { padding: 16 },
});
