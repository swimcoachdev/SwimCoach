import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { ScreenState } from "@/components/ui/ScreenState";
import { SwimmerDetail } from "@/features/swimmer/SwimmerDetail";
import { useSwimmerProfile, useTimeProgression, useSwimmerSeasonDetail } from "@/lib/queries/swimmers";
import { seasonProgress } from "@/lib/utils/season";

export default function SwimmerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const year = new Date().getFullYear();

  const profileQ = useSwimmerProfile(id);
  const progressionQ = useTimeProgression(id);
  const detailQ = useSwimmerSeasonDetail(id, year);

  return (
    <Screen>
      <ScreenState query={profileQ} errorText="Uimaria ei löytynyt.">
        {(profile) => (
          <SwimmerDetail
            profile={profile}
            summary={detailQ.data ?? null}
            progression={progressionQ.data ?? []}
            year={year}
            seasonProgress={seasonProgress(new Date())}
            onBack={() => router.back()}
          />
        )}
      </ScreenState>
    </Screen>
  );
}
