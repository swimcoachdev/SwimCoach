import { ScrollView, StyleSheet } from "react-native";
import { Trophy } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Header } from "@/components/ui/Header";
import { ScreenState } from "@/components/ui/ScreenState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSwimmerContext } from "@/hooks/useSwimmerContext";
import { useTimeProgression } from "@/lib/queries/swimmers";
import { groupResultsByEvent } from "@/features/swimmer/swimmer-competitions.lib";
import { SwimmerEventCard } from "@/features/swimmer/SwimmerEventCard";
import { space } from "@/constants/theme";

export default function SwimmerCompetitionsScreen() {
  const { swimmerId, ready } = useSwimmerContext();
  const progressionQ = useTimeProgression(swimmerId ?? undefined);
  const events = groupResultsByEvent(progressionQ.data ?? []);

  return (
    <Screen>
      <Header title="Kilpailutulokset" subtitle={`${events.length} tapahtumaa`} />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        <ScreenState
          query={progressionQ}
          busy={!ready}
          isEmpty={() => events.length === 0}
          empty={<EmptyState icon={Trophy} text={"Ei kisatuloksia vielä.\nValmentaja lisää tulokset."} />}
        >
          {() => events.map((g) => <SwimmerEventCard key={g.event} group={g} />)}
        </ScreenState>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: space.lg, paddingBottom: space.xxxl, gap: space.md },
});
