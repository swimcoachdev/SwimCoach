import { useState } from "react";
import { useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { ScreenState } from "@/components/ui/ScreenState";
import { RosterScreen } from "@/features/swimmer/RosterScreen";
import { useAuth } from "@/hooks/useAuth";
import { useCoachContext } from "@/hooks/useCoachContext";
import { useSeasonSummary } from "@/lib/queries/swimmers";
import { useClubGroups } from "@/lib/queries/groups";
import { type LensKey } from "@/features/swimmer/swimmer-card.lib";
import { seasonProgress } from "@/lib/utils/season";

export default function CoachDashboard() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { clubId, ready } = useCoachContext();
  const year = new Date().getFullYear();
  const progress = seasonProgress(new Date());

  const [lens, setLens] = useState<LensKey>("goal");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

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
            onLens={setLens}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
            seasonProgress={progress}
            refreshing={summaryQ.isRefetching}
            onRefresh={() => summaryQ.refetch()}
            onSignOut={signOut}
            onOpenSwimmer={(id) => router.push(`/coach/swimmers/${id}`)}
            onNewWorkout={() => router.push("/coach/workout/new")}
          />
        )}
      </ScreenState>
    </Screen>
  );
}
