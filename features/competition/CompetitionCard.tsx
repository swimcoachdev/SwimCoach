import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Competition } from "@/features/competition/competitions.lib";

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  SM:             { bg: "#FEF9C3", text: "#A16207" },
  piiri:          { bg: "#DBEAFE", text: "#1D4ED8" },
  seura:          { bg: "#DCFCE7", text: "#15803D" },
  kansainvälinen: { bg: "#F3E8FF", text: "#7E22CE" },
};

export function CompetitionCard({ competition, onPress }: { competition: Competition; onPress: () => void }) {
  const lc = (competition.level && LEVEL_COLORS[competition.level]) || { bg: "#F1F5F9", text: "#475569" };
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={s.cardMain}>
        <Text style={s.cardName}>{competition.name}</Text>
        <Text style={s.cardSub}>
          {competition.competition_date}{competition.location ? ` · ${competition.location}` : ""}
        </Text>
      </View>
      <View style={s.cardRight}>
        {competition.level && (
          <View style={[s.levelBadge, { backgroundColor: lc.bg }]}>
            <Text style={[s.levelText, { color: lc.text }]}>{competition.level}</Text>
          </View>
        )}
        <Text style={s.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 8,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardMain: { flex: 1, marginRight: 12 },
  cardName: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  cardSub: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  levelText: { fontSize: 11, fontWeight: "600" },
  chevron: { color: "#CBD5E1", fontSize: 18 },
});
