import { useState } from "react";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { ScreenState } from "@/components/ui/ScreenState";
import { RosterScreen } from "@/features/swimmer/RosterScreen";
import { useCoachContext } from "@/hooks/useCoachContext";
import { useSeasonSummary } from "@/lib/queries/swimmers";
import { useClubGroups } from "@/lib/queries/groups";
import { type LensKey } from "@/features/swimmer/swimmer-card.lib";
import { seasonProgress } from "@/lib/utils/season";

export default function CoachDashboard() {
  const router = useRouter();
  const { clubId, ready } = useCoachContext();
  const year = new Date().getFullYear();
  const progress = seasonProgress(new Date());

  const [lens, setLens] = useState<LensKey>("goal");
  const [reversed, setReversed] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Tap a lens to switch (back to its natural order); re-tap the active one to flip.
  const handleLens = (next: LensKey) => {
    if (next === lens) {
      setReversed((r) => !r);
    } else {
      setLens(next);
      setReversed(false);
    }
  };

  const summaryQ = useSeasonSummary(clubId ?? undefined, year);
  const groupsQ = useClubGroups(clubId ?? undefined);

  return (
    <Screen>
      <ScreenState query={summaryQ} busy={!ready}>
        {(swimmers) => (
          <RosterScreen
            swimmers={swimmers}
            groups={groupsQ.data ?? []}
            lens={lens}
            reversed={reversed}
            onLens={handleLens}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
            search={search}
            onSearch={setSearch}
            seasonProgress={progress}
            refreshing={summaryQ.isRefetching}
            onRefresh={() => summaryQ.refetch()}
            onOpenSwimmer={(id) => router.push(`/coach/swimmers/${id}`)}
            onNewWorkout={() => router.push("/coach/workout/new")}
          />
        )}
      </ScreenState>
    </Screen>
  );
}
