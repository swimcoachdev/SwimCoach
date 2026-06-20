---
name: build-backend
description: Build the SwimCoach Supabase backend — migrations, Row-Level Security policies, the season-summary view, seed data, generated types, and edge functions (the AI copilot) — to the project's conventions (migrations are the schema source of truth, RLS is club-scoped via current_club_id(), views avoid join fan-out, types are generated never hand-written, every new table needs explicit policies). Use when adding or changing a table, column, policy, view, trigger, seed, type, or edge function. The source of truth for how we build the backend.
---

# Build backend

This skill owns **how we build the SwimCoach Supabase backend** (`supabase/`). It is the source of
truth for backend conventions — `CLAUDE.md` only points here, and run/check commands live there.

Supabase enforces auth, the Postgres engine, and PostgREST. This skill covers what it *won't* enforce:
which changes are migrations vs seed, the RLS shape, the safe-aggregation pattern for views, and keeping
the generated types honest.

## When to use

- Adding/changing a table, column, enum, index, **RLS policy**, view, trigger, function, or seed row.
- Building or fixing an **edge function** (the AI copilot in `supabase/functions/`).
- "Add a wellness column to attendance", "expose a load-trend view", "tighten RLS on competitions."

## When not to use

- Screens, components, query hooks, styling → `build-mobile`.
- Product/architecture rationale → the dated docs in `docs/`, not here.

## Stack & layout

- **Supabase** = Postgres + Auth + RLS + PostgREST + Deno edge functions. Local stack runs via the
  Supabase CLI on **remapped ports 553xx** (coexists with the user's other local projects — never
  `supabase stop` theirs).

```
supabase/
  config.toml                       # CLI config; ports remapped to 553xx
  migrations/<NNN>_<slug>.sql        # schema source of truth, applied in order
  seed.sql                          # local demo data (auto-run by `supabase db reset`)
  functions/<name>/index.ts         # Deno edge functions (the AI copilot)
  sql-archive/                      # superseded/broken SQL kept for reference, NOT applied
types/database.ts                   # GENERATED from the live schema — never hand-edit
```

Run/reset commands and local URLs/keys are in `CLAUDE.md`.

## Rules

### Migrations are the schema source of truth
- Every schema change is a **new timestamped/ordered migration** in `supabase/migrations/`. No ad-hoc DDL
  applied straight to the DB, and never edit a migration that's already been shared/run — add a new one.
- Keep exactly **one** active definition per object. The repo shipped two `001_*` schema files (the
  un-suffixed one is broken — `pgvector` vs `vector`, a subquery in a generated column); the broken one
  lives in `sql-archive/` and must not re-enter `migrations/`.
- After any schema change, **regenerate types**: `npm run db:types` → `types/database.ts`. Never
  hand-write or hand-edit DB row types; the frontend derives from this file.

### Row-Level Security (the biggest footgun here)
- **RLS-enabled with no policy = deny-all.** The base schema enabled RLS on most tables but left them
  without policies and had **no "read your own `users` row"** policy — which silently broke role
  resolution. Every table that has RLS on **must** get explicit policies, added in the same migration.
- **Club-scope through the `current_club_id()` helper** (`SECURITY DEFINER`, `STABLE`) — never inline a
  raw `SELECT club_id FROM users WHERE id = auth.uid()` subquery in a policy (it re-enters RLS and returns
  nothing). Direct-club tables: `club_id = public.current_club_id()`. Child tables: scope via their parent
  (`swimmer_id IN (SELECT id FROM swimmers WHERE club_id = public.current_club_id())`).
- Scope every per-user read/write by the principal — never trust a client-supplied club/swimmer id.

### Views & aggregation
- **Never `SUM` a per-row metric across a join that also fans out a child table.** The original
  `swimmer_season_summary` summed `actual_pool_m` while joined to `pool_sets`, multiplying volume by
  #sets/workout. Aggregate **each grain in its own subquery** (volume from `workout_attendance`; zone
  metres from `pool_sets`) and join the pre-aggregated results. Ratios (zone %) are safe because the
  fan-out cancels; absolute sums are not.
- `CREATE OR REPLACE VIEW` can only **append** columns — to reorder/insert, `DROP VIEW` first.
- Views are **security-definer by default → they bypass RLS.** Fine for the local single-club demo; before
  relying on a view for multi-tenant isolation in production, set `security_invoker = on`.

### Domain correctness
- Enums are exact: strokes `vapaa/selka/rinta/perho/sekauinti` (note `selka`, no umlaut); zones
  `pk/vk/mk/mak`; `race_distance` is TEXT `'50'..'1500'`; times are integer **milliseconds**.
- The repo's `demo_*.sql` files drifted from the schema (reference non-existent `swimmers.primary_stroke`
  / `lane_number`, wrong PR conflict columns) and won't load — `seed.sql` is the maintained seed. Keep
  seed inserts matched to the real column set, and the seed creates its own auth user for local login.

### Edge functions (AI copilot)
- Deno + the service-role client, in `supabase/functions/<name>/`. Resolve the principal from the JWT,
  fetch only that club's structured context, call the model, return JSON. Keep the rule-based
  `lib/ai/copilot.ts` as a zero-cost offline fallback. (No `\!`-escaped source — that's a shell artifact
  that breaks the file.)

## Build workflow

1. **Decide migration vs seed.** Schema/policy/view/function → a new migration. Demo rows → `seed.sql`.
2. **Write the migration** (timestamped). For a new table: create it, `ENABLE ROW LEVEL SECURITY`, **and add
   its policies** in the same file.
3. **Apply + verify:** `supabase db reset` (re-runs migrations + seed). Confirm with a signed-in query
   exercising RLS, not just a service-role read.
4. **Regenerate types:** `npm run db:types`.
5. Update `seed.sql` if the new shape needs demo data.

## Guardrails (non-negotiable)

- Every schema change is a new migration; never edit an applied one; never apply ad-hoc DDL.
- Every RLS-enabled table gets explicit policies in the same migration; scope via `current_club_id()`,
  never a raw inline `users` subquery; never trust a client-supplied club/swimmer id.
- Never `SUM` a per-row metric across a child-table fan-out — aggregate per grain in subqueries.
- Never hand-write/edit `types/database.ts` — regenerate with `npm run db:types`.
- Keep one active definition per object; broken/superseded SQL goes to `sql-archive/`, never `migrations/`.
- Don't `supabase stop` the user's other local projects; SwimCoach is pinned to 553xx by design.

## Resources

- [references/backend-checklist.md](references/backend-checklist.md) — run through on every change.
- Frontend/data-hook conventions: the `build-mobile` skill. Run/reset commands, local URLs & demo login: `CLAUDE.md`.
- Direction & priorities (incl. making the AI copilot real): the dated docs in `docs/`.
