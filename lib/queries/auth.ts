import { supabase } from "@/lib/supabase";

/** Query-key factory for identity/context lookups. */
export const authKeys = {
  all: ["auth"] as const,
  role: (userId: string) => [...authKeys.all, "role", userId] as const,
  coachContext: (userId: string) => [...authKeys.all, "coach-context", userId] as const,
  swimmerContext: (userId: string) => [...authKeys.all, "swimmer-context", userId] as const,
};

/** The user's role (coach / swimmer / club_admin) from the users table. */
export async function getUserRole(userId: string): Promise<string | null> {
  const { data } = await supabase.from("users").select("role").eq("id", userId).single();
  return data?.role ?? null;
}

/** Resolve a coach's club + coach ids from their auth user id. */
export async function getCoachContext(userId: string) {
  const [{ data: u }, { data: c }] = await Promise.all([
    supabase.from("users").select("club_id").eq("id", userId).single(),
    supabase.from("coaches").select("id").eq("user_id", userId).single(),
  ]);
  return { clubId: u?.club_id ?? null, coachId: c?.id ?? null };
}

/** Resolve a swimmer's club + swimmer ids from their auth user id. */
export async function getSwimmerContext(userId: string) {
  const [{ data: u }, { data: s }] = await Promise.all([
    supabase.from("users").select("club_id").eq("id", userId).single(),
    supabase.from("swimmers").select("id").eq("user_id", userId).single(),
  ]);
  return { clubId: u?.club_id ?? null, swimmerId: s?.id ?? null };
}

export function signOut() {
  return supabase.auth.signOut();
}
