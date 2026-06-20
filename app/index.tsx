import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Screen } from "@/components/ui/Screen";
import { PaceClock } from "@/components/ui/PaceClock";

/**
 * Entry route for `/`. Without it, the root URL matches no screen and Expo Router
 * shows the file-picker sitemap. This lands every visit (and every browser reload)
 * on the right place for the signed-in role.
 */
export default function Index() {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <Screen center>
        <PaceClock size={48} />
      </Screen>
    );
  }
  if (!session) return <Redirect href="/auth/login" />;

  const isCoach = role === "coach" || role === "club_admin";
  return <Redirect href={isCoach ? "/coach" : "/swimmer"} />;
}
