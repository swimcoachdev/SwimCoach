# SwimCoach

Multi-tenant SaaS for swim clubs. Coaches track each swimmer's training volume, intensity-zone split,
competition results/PRs and yearly goals; swimmers see their own progress; an "AI copilot" answers
questions about the group. Finnish-language UI.

Stack: **Expo SDK 56 / React Native 0.85 + Expo Router**, **Supabase** (Postgres + Auth + RLS),
TanStack Query + Zustand, `victory-native` charts. Runs iOS / Android / web (web = centered
phone-width column).

## How we build — read the skill first

Conventions live in skills, not here. Load the relevant one before writing code:

- **`build-mobile`** — screens, components, hooks, queries (`app/`, `components/`, `hooks/`, `lib/`).
- **`build-backend`** — migrations, RLS, views, seed, generated types, edge functions (`supabase/`).

Direction & priorities: the dated docs in `docs/` (read the latest roadmap there).

## Run

```bash
# 1. Backend (local Supabase, Docker). Ports remapped to 553xx to coexist with other local projects.
supabase start                 # Studio http://127.0.0.1:55323 · API http://127.0.0.1:55321
supabase db reset              # re-apply migrations + seed after schema/seed changes
supabase status                # print live URLs + anon/service keys

# 2. App
npx expo start --web           # or --ios / --android (Expo Go)
```

`.env.local` (gitignored) points at the local stack:
```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<local anon key from `supabase status`>
```
Demo login: **coach@swimcoach.test / swimcoach**. The Supabase client throws on boot without env;
screens are empty without a seeded DB.

## Checks

```bash
npx tsc --noEmit               # type-check
npx expo start -c              # run with a cleared Metro cache if a change doesn't show
```

## Dependencies — install gotchas (cost hours once)

- Keep **react and react-dom versions identical** (a `react`=`19.2.3` / `react-dom`=`^19.2.3` mismatch
  floated react-dom to 19.2.7 and broke resolution).
- If install hangs or corrupts: `rm -rf node_modules package-lock.json && npm install --no-audit --no-fund`.
  Never run two installs at once; never `npm cache verify` to "fix" one (it GCs the cache). On a flaky
  link add `--fetch-retries=12 --fetch-timeout=600000 --maxsockets=3`.
- For Expo-managed native deps prefer `npx expo install <pkg>` over `npm install`.

## Domain glossary (Finnish swim coaching — keep terms exact)

- **Intensity zones** (`constants/zones.ts`): `pk` Peruskestävyys (T1, base) · `vk` Vauhtikestävyys (T2)
  · `mk` Matkakestävyys (T3) · `mak` Maksimikestävyys (T4, anaerobic). Goals store a target % split.
- **Strokes** (`constants/strokes.ts`): `vapaa` free · `selka` back (no umlaut) · `rinta` breast ·
  `perho` fly · `sekauinti` IM.
- **Race distances**: TEXT `'50'..'1500'` m. Times are integer **milliseconds** (format via `lib/utils/time.ts`).
- Key view `swimmer_season_summary` aggregates per-swimmer season stats (volume, zone %, goal %) and
  drives the coach dashboard + copilot.
