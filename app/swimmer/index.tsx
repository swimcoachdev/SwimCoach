import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useSwimmerContext } from "@/hooks/useSwimmerContext";
import { useSwimmerProfile, useTimeProgression, useRecentWorkouts } from "@/lib/queries/swimmers";
import { SwimmerHome } from "@/features/swimmer/SwimmerHome";

export default function SwimmerDashboard() {
  const { signOut } = useAuth();
  const { swimmerId, ready } = useSwimmerContext();
  const year = new Date().getFullYear();

  const profileQ = useSwimmerProfile(swimmerId ?? undefined);
  const progressionQ = useTimeProgression(swimmerId ?? undefined);
  const workoutsQ = useRecentWorkouts(swimmerId ?? undefined, 20);

  function refresh() {
    profileQ.refetch();
    progressionQ.refetch();
    workoutsQ.refetch();
  }

  if (!ready || profileQ.isLoading || !profileQ.data) {
    return <View style={s.center}><ActivityIndicator size="large" color="#0EA5E9" /></View>;
  }

  return (
    <SwimmerHome
      profile={profileQ.data}
      progression={progressionQ.data ?? []}
      recentWorkouts={workoutsQ.data ?? []}
      year={year}
      refreshing={profileQ.isRefetching || workoutsQ.isRefetching}
      onRefresh={refresh}
      onSignOut={() => signOut()}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
