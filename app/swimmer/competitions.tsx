import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSwimmerContext } from "@/hooks/useSwimmerContext";
import { useTimeProgression } from "@/lib/queries/swimmers";
import { groupResultsByEvent } from "@/features/swimmer/swimmer-competitions.lib";
import { SwimmerEventCard } from "@/features/swimmer/SwimmerEventCard";

export default function SwimmerCompetitionsScreen() {
  const { swimmerId } = useSwimmerContext();
  const progressionQ = useTimeProgression(swimmerId ?? undefined);
  const events = groupResultsByEvent(progressionQ.data ?? []);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>Kilpailutulokset</Text>
        <Text style={s.subtitle}>{events.length} tapahtumaa</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {events.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🏆</Text>
            <Text style={s.emptyText}>Ei kisatuloksia vielä.{"\n"}Valmentaja lisää tulokset.</Text>
          </View>
        ) : (
          events.map((g) => <SwimmerEventCard key={g.event} group={g} />)
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#ffffff", paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  empty: { alignItems: "center", paddingVertical: 64 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: "#94a3b8", textAlign: "center", lineHeight: 20 },
});
