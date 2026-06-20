import { useQuery } from "@tanstack/react-query";
import { authKeys, getSwimmerContext } from "@/lib/queries/auth";
import { useAuth } from "./useAuth";

interface SwimmerContext {
  swimmerId: string | null;
  clubId: string | null;
  ready: boolean;
}

/** Swimmer identity (swimmer + club ids) as server state, resolved once per user. */
export function useSwimmerContext(): SwimmerContext {
  const { user } = useAuth();
  const q = useQuery({
    queryKey: authKeys.swimmerContext(user?.id ?? ""),
    enabled: !!user,
    queryFn: () => getSwimmerContext(user!.id),
  });

  return {
    swimmerId: q.data?.swimmerId ?? null,
    clubId: q.data?.clubId ?? null,
    ready: !!user && q.isSuccess,
  };
}
