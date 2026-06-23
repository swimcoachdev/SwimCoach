# SwimCoach

A multi-tenant SaaS application for swim clubs. Coaches track each swimmer's training
volume, intensity-zone distribution, competition results and personal records, and yearly
goals; swimmers get a focused view of their own progress; and an AI copilot answers natural-
language questions about the group. The UI is in Finnish and runs on iOS, Android, and the web.

> **Status:** active development. The app targets a single coaching workflow first, with the
> data model and access control already built for multiple clubs.

## Features

**For coaches**
- **Group dashboard** — an attention-first overview of every swimmer's season at a glance:
  training volume, intensity-zone split, goal progress, and what needs follow-up.
- **Swimmer detail** — yearly goals, zone distribution versus target, personal records, and
  competition-time progression.
- **Workout logging** — pool sets recorded per intensity zone, plus attendance.
- **Competitions** — record results with automatic personal-record updates.
- **AI copilot** — answers questions about the group in Finnish (e.g. "who has trained the
  most this season?", "whose goal is at risk?"), backed by a Supabase Edge Function.

**For swimmers**
- A personal view of goals, logged workouts, and competition results.

## Tech stack

| Layer        | Choice                                                            |
| ------------ | ----------------------------------------------------------------- |
| App          | Expo SDK 56 · React Native 0.85 · Expo Router (file-based routing) |
| Language     | TypeScript (strict)                                               |
| Server state | TanStack Query over `supabase-js`                                 |
| Local state  | Zustand (multi-step form state only)                             |
| Charts       | `victory-native`                                                  |
| Styling      | React Native `StyleSheet` with shared theme tokens               |
| Backend      | Supabase — PostgreSQL, Auth, Row-Level Security, Edge Functions  |
| Copilot      | Supabase Edge Function (Deno) calling the OpenAI API             |

The web build renders as a centered, phone-width column.

## Architecture

```
app/                 # Screens & routes (Expo Router, file-based)
  auth/              #   Login
  coach/             #   Coach experience: dashboard, swimmers, workouts, competitions, copilot, account
  swimmer/           #   Swimmer experience: home, goals, workouts, competitions, account
  onboarding/        #   New-swimmer baseline + goals
components/
  ui/                # Reusable primitives (Button, Card, Chip, Field, Screen, Text, …)
  charts/            # GoalProgress, ZoneDistribution, WeeklyVolumeChart, TimeProgressionChart
features/            # Feature modules (account, competition, onboarding, swimmer, workout)
hooks/               # Shared React hooks
lib/
  queries/           # Supabase query functions (the data layer)
  realtime/          # Supabase realtime subscriptions
  ai/                # Copilot client
  utils/             # Time/format helpers (race times are integer milliseconds)
constants/           # Domain constants: zones, strokes, theme tokens
supabase/
  migrations/        # Schema source of truth
  functions/copilot/ # AI copilot Edge Function
  seed.sql           # Demo data
types/               # Generated database types (never hand-edited)
docs/                # Dated roadmap & UX/IA direction
```

### Data model & access control

The backend is multi-tenant and club-scoped: Row-Level Security policies restrict every row
to the caller's club, so each club only ever sees its own data. The key reporting object is the
`swimmer_season_summary` view, which aggregates per-swimmer season statistics (volume, zone
percentages, goal progress) into one row per swimmer and drives both the coach dashboard and the
copilot.

Core tables:

- `swimmers` — swimmers, their group, and account link
- `yearly_goals` — season targets (distance, sessions, intensity-zone split, competition goal)
- `workouts` · `workout_attendance` · `pool_sets` — training data
- `competition_results` · `personal_records` — race results and PRs

## Getting started

### Prerequisites

- Node.js and npm
- [Supabase CLI](https://supabase.com/docs/guides/cli) and Docker (for the local stack)
- An OpenAI API key (only needed to run the copilot Edge Function)

### 1. Start the backend (local Supabase)

Local ports are remapped to the `553xx` range to coexist with other local projects.

```bash
supabase start                 # Studio http://127.0.0.1:55323 · API http://127.0.0.1:55321
supabase db reset              # apply migrations + seed
supabase status                # print live URLs and anon/service keys
```

### 2. Configure the app

Create `.env.local` (gitignored) pointing at the local stack:

```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<local anon key from `supabase status`>
```

> The Supabase client throws on boot if these are missing, and screens render empty without a
> seeded database.

### 3. Run the app

```bash
npm install
npx expo start --web           # or --ios / --android (Expo Go)
```

**Demo login:** `coach@swimcoach.test` / `swimcoach`

### Copilot Edge Function (optional)

The copilot runs as a Supabase Edge Function backed by OpenAI. To run or deploy it, set the API
key as a function secret:

```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase functions deploy copilot
```

## Checks

```bash
npx tsc --noEmit               # type-check
npm test                       # unit tests (Vitest)
npm run db:types               # regenerate types/database.ts from the local schema
npx expo start -c              # run with a cleared Metro cache if a change doesn't appear
```

## Domain glossary (Finnish swim coaching)

These terms are kept exact throughout the codebase.

- **Intensity zones** (`constants/zones.ts`): `pk` Peruskestävyys (base) · `vk` Vauhtikestävyys ·
  `mk` Matkakestävyys · `mak` Maksimikestävyys (anaerobic). Goals store a target percentage split.
- **Strokes** (`constants/strokes.ts`): `vapaa` free · `selka` back · `rinta` breast · `perho` fly ·
  `sekauinti` individual medley.
- **Race distances**: text values `'50'`–`'1500'` metres. Times are stored as integer milliseconds.

## Conventions

Build conventions live in the project's skills rather than in this file:

- **`build-mobile`** — screens, components, hooks, and queries (`app/`, `components/`, `hooks/`, `lib/`).
- **`build-backend`** — migrations, RLS, views, seed, generated types, and Edge Functions (`supabase/`).

Migrations are the schema source of truth, every new table needs explicit RLS policies, and
database types are generated — never hand-written. Direction and priorities live in the dated
docs under `docs/`.

## License

See [LICENSE](./LICENSE).
