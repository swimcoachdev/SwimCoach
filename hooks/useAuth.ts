import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { authKeys, getUserRole, signOut } from "@/lib/queries/auth";
import type { Session, User } from "@supabase/supabase-js";

export type UserRole = "coach" | "swimmer" | "club_admin";

interface AuthState {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signOut: typeof signOut;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // The auth session is a genuine subscription (not server-state we fetch), so it
  // stays an effect. The role lookup that hangs off it is server state → a query.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSessionLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const roleQ = useQuery({
    queryKey: authKeys.role(session?.user?.id ?? ""),
    enabled: !!session?.user,
    queryFn: () => getUserRole(session!.user.id),
  });

  return {
    session,
    user: session?.user ?? null,
    role: (roleQ.data ?? null) as UserRole | null,
    loading: sessionLoading || (!!session && roleQ.isLoading),
    signOut,
  };
}
