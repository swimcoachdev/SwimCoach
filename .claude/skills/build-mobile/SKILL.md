---
name: build-mobile
description: Build the SwimCoach React Native (Expo) client — screens, features, components, hooks — to the project's conventions (Expo Router file-based routing, TanStack Query over the supabase-js data layer for all server state, Zustand only for multi-step form state, pure logic + types in *.lib.ts, StyleSheet with theme tokens, strict types, Finnish UI). Use when adding or changing any screen, component, hook, or query in app/ or components/. The source of truth for how we build the client.
---

# Build mobile

This skill owns **how we build the SwimCoach client** (`app/`, `components/`, `hooks/`, `lib/`).
It is the source of truth for client conventions — `CLAUDE.md` only points here, and run/check
commands live there.

The current code is **pre-convention** (AI-generated): screens fetch with `useEffect` + `useState`,
colors are hardcoded hex, there is no theme module and no tests. Treat the rules below as the
**target** every file you touch should move toward — don't rewrite the world in one diff, but never
add new code in the old style.

## When to use

- Adding/changing a screen, feature, component, hook, or query under `app/` or `components/`.
- "Build the swimmer-detail trend chart", "add the workout-entry set builder", "reskin the dashboard."

## When not to use

- Database, RLS, migrations, the season-summary view, edge functions → `build-backend`.
- Product/architecture rationale → the dated docs in `docs/`, not here.

## Stack

- **React Native + Expo** (managed), **Expo Router** for file-based routing in `app/` (typed routes are
  on — `app.json` → `experiments.typedRoutes`). Navigate with `router.push("/coach/swimmers/[id]")`;
  read params with `useLocalSearchParams`. **Not** React Navigation.
- **Supabase** is the backend (Postgres + Auth + RLS). The client talks to it directly via the shared
  `supabase` client (`lib/supabase.ts`) — there is no separate HTTP API.
- **TanStack Query** (already a dependency) for **all server state**. **Zustand** only for ephemeral
  multi-step form state, co-located with its feature (`features/workout/useNewWorkoutStore.ts`,
  `features/onboarding/useOnboardingStore.ts`) — never for server data.
- **Types are generated** from the database: `npm run db:types` → `types/database.ts`. Never hand-write
  table row types; derive from the generated `Database` type.
- **Charts:** `victory-native`. **Styling:** `StyleSheet.create` against tokens in `constants/theme.ts`
  (to be established — see Styling). Runs iOS / Android / web (web = centered phone-width column).

## Layout

```
app/                       # Expo Router screens ONLY (the route tree IS the file tree —
  <area>/_layout.tsx       #   keep non-route code out of app/, or it becomes a route)
  <area>/index.tsx         # orchestrator screen
  <area>/[id].tsx          # dynamic route, id via useLocalSearchParams
features/<feature>/        # a feature's UI + its view-model + its local state, co-located
  SwimmerCard.tsx          #   presentational component(s)
  swimmer-card.lib.ts      #   pure transforms/calc/types for that feature (no react-native)
  useNewWorkoutStore.ts    #   feature-local zustand form state (workout/onboarding)
components/ui/             # SHARED design-system primitives (Text, Badge, PaceClock, TabIcon)
components/charts/         # SHARED victory-native chart wrappers (used across features)
hooks/                     # cross-cutting ONLY: useAuth, use{Coach,Swimmer}Context (resolve ids).
                           #   feature-local stores live in features/<feature>/, not here
lib/queries/<entity>.ts    # supabase-js query functions (one file per entity)
lib/utils/*.ts             # cross-cutting pure helpers (time.ts, zones.ts) — no react-native
constants/                 # domain truth: zones.ts, strokes.ts, theme.ts (design tokens)
types/database.ts          # GENERATED — never hand-edit
```

`components/` holds only **shared** code (`ui/`, `charts/`); anything specific to one feature
lives in `features/<feature>/` alongside its view-model `*.lib.ts`. A feature's `.lib.ts` still
imports nothing from `react-native`.

## Rules

### Data access
- All server reads/writes go through a **named query function in `lib/queries/<entity>.ts`** that wraps
  the `supabase` client, consumed by a **TanStack Query hook** in the screen. No `supabase.from(...)`
  calls scattered inside component bodies, and no `useEffect`+`useState` load patterns for server data.
- Realtime subscriptions (e.g. the coach dashboard's `postgres_changes`) live in the orchestrator and
  invalidate the relevant query keys rather than hand-managing state.
- Every query is **club-scoped by the backend RLS**, not by passing a client-supplied club id you can't
  trust — see `build-backend`. Read ids from `use*Context` hooks.

### Logic location
- **No `useEffect` for derived state or data fetching.** Compute during render; fetch with TanStack
  Query. Effects are only for genuine side-effects (realtime channel lifecycle, listeners, imperative refs).
- Pure logic, calculations, and types live in a `*.lib.ts` — feature view-models next to their
  component (`features/<feature>/swimmer-card.lib.ts`), cross-cutting helpers in `lib/utils/*` —
  **never** in a `.tsx`, and a `*.lib.ts` imports nothing from `react-native`. The zone/time/“at
  risk” math is domain logic and belongs there (e.g. `lib/utils/zones.ts`, `features/swimmer/
  swimmer-card.lib.ts`), not inline in a card.
- No `useMemo` / `useCallback` / `React.memo` by default — add only where a measured render cost or a
  stable-reference requirement (charts, list items) genuinely needs it.

### Component split
- **Orchestrator screen** (`app/.../index.tsx`) owns queries, params, and navigation; passes data +
  callbacks one level down.
- **Presentational children** (`components/...`) are `props → JSX`: no data layer, no queries, no
  navigation beyond a passed callback; only UI-only `useState`. They don't re-fetch a prop they're given.

### Styling
- `StyleSheet.create` against **tokens** (`constants/theme.ts`: colors, spacing, type scale, radii,
  shadows) — **no hardcoded hex, no ad-hoc magic numbers** duplicating a token. The accent is one token,
  not `#0EA5E9` sprinkled across 15 files. Zone/stroke colors come from `constants/zones.ts`.
- **Native- and web-safe layout only.** No web-only CSS strings in `style` (e.g. `width: "calc(50% - 6px)"`
  breaks native — use flex / percentage / `Dimensions`). Prefer real icons over emoji.
- Wrap screens in safe-area insets; don't hand-compute notch padding.

### UI language & domain
- **UI strings are Finnish.** Use `constants/zones.ts` / `constants/strokes.ts` for all labels and colors;
  never re-spell an enum inline (it's `selka`, not `selkä`). Times are integer ms — format via
  `lib/utils/time.ts`.

### Code quality
- Strict TypeScript: no `any`, no `@ts-ignore` / `eslint-disable` to compile — fix the cause.
- Comment the **why**, not the what. No section-divider banners or name-restating comments.

## Build workflow

1. **Scope one screen/feature** (bounded diff). Bigger → split.
2. **Pure first.** Calculations + types into the feature's `*.lib.ts` / `lib/utils/*`.
3. **Query layer.** Add/extend `lib/queries/<entity>.ts`; expose a TanStack Query hook.
4. **Orchestrator screen.** Read route params + context ids, compose queries, handle navigation/realtime.
5. **Presentational children.** `props → JSX`, tokens only.
6. **Validate** (commands in `CLAUDE.md`): `npx tsc --noEmit`, then run it (`npx expo start --web`).

## Guardrails (non-negotiable)

- Never add a `useEffect` for derived state or server fetching; never call `supabase.from(...)` inside a
  component — go through `lib/queries/*` + a TanStack Query hook.
- Never hardcode a color/spacing literal that a theme token covers; never use web-only CSS in native styles.
- Never hand-write a DB row type — regenerate `types/database.ts` with `npm run db:types`.
- Keep pure logic out of `.tsx`; a `*.lib.ts` never imports `react-native`.
- Never suppress checks to compile. One feature per change. Ask before adding a top-level dependency.

## Resources

- [references/mobile-checklist.md](references/mobile-checklist.md) — run through on every file you touch.
- Backend/data conventions: the `build-backend` skill. Run/check commands & domain glossary: `CLAUDE.md`.
- Direction & priorities: `docs/2026-06-20-swimcoach-roadmap.md`.
