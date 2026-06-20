import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Text } from "@/components/ui/Text";
import { color, space, radius, shadow } from "@/constants/theme";
import type { Competition } from "@/features/competition/competitions.lib";

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  SM:             { bg: color.warnWash, text: color.warn },
  piiri:          { bg: color.primaryWash, text: color.primaryInk },
  seura:          { bg: color.goodWash, text: color.good },
  kansainvälinen: { bg: color.primaryWash, text: color.primaryInk },
};

export function CompetitionCard({ competition, onPress }: { competition: Competition; onPress: () => void }) {
  const lc = (competition.level && LEVEL_COLORS[competition.level]) || { bg: color.border, text: color.inkMuted };
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={s.cardMain}>
        <Text variant="bodyStrong" style={s.cardName}>{competition.name}</Text>
        <Text variant="caption" color={color.inkFaint} style={s.cardSub}>
          {competition.competition_date}{competition.location ? ` · ${competition.location}` : ""}
        </Text>
      </View>
      <View style={s.cardRight}>
        {competition.level && (
          <View style={[s.levelBadge, { backgroundColor: lc.bg }]}>
            <Text variant="caption" color={lc.text} style={s.levelText}>{competition.level}</Text>
          </View>
        )}
        <ChevronRight size={18} color={color.inkFaint} />
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: color.surface, borderRadius: radius.lg, padding: space.lg, marginBottom: space.sm,
    flexDirection: "row", alignItems: "center",
    ...shadow.card },
  cardMain: { flex: 1, marginRight: space.md },
  cardName: { fontSize: 14 },
  cardSub: { marginTop: 2 },
  cardRight: { flexDirection: "row", alignItems: "center", gap: space.sm },
  levelBadge: { paddingHorizontal: space.sm, paddingVertical: 3, borderRadius: radius.sm },
  levelText: { fontSize: 11 },
});
