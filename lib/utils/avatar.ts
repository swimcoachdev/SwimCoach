/**
 * Deterministic avatar presentation for a person's name — initials + a stable
 * colour picked from a fixed palette. Pure and seeded only by the name, so the
 * same swimmer always gets the same colour. No react-native imports.
 */
const AVATAR_COLORS = ["#0EA5E9", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444"];

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
