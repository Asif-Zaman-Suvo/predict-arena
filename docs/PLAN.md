# Implementation Plan: FIFA World Cup 2026 Predictor — Frontend

**Status:** Implemented (aligned with codebase as of 2026-05-30)  
**Spec:** `docs/SPEC.md` · **Task checklist:** `docs/TASKS.md`

---

## Overview

Static-data, client-state prediction app delivered in **15 implementation tasks** across **10 phases** (see `TASKS.md`). The original 21-task plan assumed 48 group matches, `/predict/*`, `/teams`, `/schedule`, and a `tournament.store`. The shipped product uses **72** group matches, **`/fixtures`** as the sole score-entry surface, **`tournament.selectors.ts`** for derived state, and **React 19** actions/optimistic/Suspense patterns.

**Build verification:** `npm run build` (23 routes) and `npx tsc --noEmit` pass.

---

## Architecture Decisions (as built)

| Decision | Choice | Rationale |
|---|---|---|
| Group predictions | `/fixtures` only | Single surface; no `/predict` hub |
| Match count | **72** (6 × 12 groups) | FIFA 2026 format |
| Empty predictions | `null` per match | Distinct from `0-0`; progress = non-null count |
| Derived standings | `computeTournamentDerived()` + `useTournamentDerived()` | No `tournament.store`, no `useEffect` sync |
| Optimistic UI | `PredictionsOptimisticProvider` + actions | One provider at layout; per-card hooks |
| Data loading | `src/data/loaders.ts` + Suspense gates | `use()` on fixtures/groups/brackets/leaderboard |
| Bracket R32 | Derived from standings + best 8 thirds | `r32-slots.ts` FIFA-style slot map |
| Knockout picks | Editable on `/brackets` when 72/72 | Replaces `/predict/knockout` |
| Schedule data | Official kickoffs/venues in JSON | `match-display.ts` for local time + meta line |
| Sample data | `sample-predictions.json` reference only | Store seeds via `buildEmptyMatchPredictions()` |
| shadcn + Tailwind v4 | CSS variables overridden in `globals.css` | Validated in Phase 1 |
| Hydration | `usePersistHydrated()` / `useHydrated()` | Zustand persist + App Router |

---

## Dependency Graph (implemented)

```
[1] Deps + design system
        │
[2] Types + mock JSON (72 group matches, 18 venues)
        │
[3] lib/* + stores + selectors + actions + hydration
        │
[4] App shell (layout, providers, nav, progress  X/72)
        │
        ├── [5]  Landing + onboarding (useActionState)
        ├── [6]  Match primitives (PredictionMatchCard, ScoreInput)
        │       ├── [7]  Groups pages (read-only, Suspense)
        │       └── [7b] Fixtures page (prediction + optimistic)
        ├── [8–9] Bracket UI + /brackets (+ /bracket redirect)
        ├── [10] Leaderboard (optimistic selectors)
        ├── [11] Community
        └── [12] Profile
                │
        [13–15] Motion, responsive, a11y polish
```

**Deferred branches (not built):** Teams (old Tasks 7–8), Schedule (16), Predict hub (13).

---

## Phase 1: Foundation ✅

### Task 1 — Design system ✅
- Zustand, Framer Motion, shadcn (`src/components/ui/`)
- Navy/gold tokens in `app/globals.css`
- `npm run build` clean

### Task 2 — Types ✅
- `src/types/tournament.ts`, `predictions.ts`, `leaderboard.ts`, `community.ts`

### Task 3 — Mock data ✅
- `teams.json` (48), `groups.json` (12)
- `matches.json` — **72** group + knockout slots (**104** total)
- `schedule.json` — **18** venues (incl. `nrg`, `lumen`)
- `results.json`, `leaderboard.json`, community JSON
- `sample-predictions.json` — not store seed
- `src/data/index.ts` with `satisfies`

### Task 4 — Domain logic ✅
- `lib/utils.ts`, `tournament.ts`, `scoring.ts`, `bracket.ts`, `r32-slots.ts`, `match-display.ts`
- `default-predictions.ts` for empty state
- Tiebreakers: Pts → GD → GF → H2H (as spec)

**Checkpoint 1:** Build, tsc, JSON populated, lib typed.

---

## Phase 2: App Shell ✅

### Task 5 — Layout + navigation ✅
- `app/layout.tsx` — `AppProviders`, `PredictionsOptimisticProvider`
- Nav: Home, **Fixtures**, Groups, **Brackets**, Leaderboard, Community, Profile
- Progress pill: `{completed} / 72` from optimistic predictions
- `SiteHeader`, `MobileNav`, `SiteFooter`, `PageWrapper`

### Task 6 — Stores (revised from original plan) ✅
- `predictions.store` — persist `pa:predictions` v2
- `user.store` — persist `pa:user`
- **`tournament.selectors.ts`** — replaces planned `tournament.store`
- `leaderboard.selectors.ts`
- `persist-hydration.ts` — `usePersistHydrated` / `useHydrated`
- `src/actions/predictions.ts`, `user.ts`
- No hydration mismatch warnings

**Checkpoint 2:** Shell loads; stores persist; no console hydration errors.

---

## Phase 3: Landing ✅

### Task 5 (TASKS) — Dashboard + onboarding ✅
- Countdown to 2026-06-11
- Progress card, quick links (Fixtures, Groups, Brackets, Leaderboard)
- `OnboardingDialog` — `useActionState(completeOnboardingAction)`

---

## Phase 4: Groups (read-only) ✅

### Task 6–7 — Primitives + pages ✅
- `TeamFlag`, `MatchCard` (kickoff + `formatMatchMeta`)
- `PredictionMatchCard`, `ScoreInput` (used on fixtures)
- `GroupCard`, `GroupGrid`, `GroupStandingsTable`, `AdvancementIndicator`
- `/groups` — `GroupsDataGate` + Suspense
- `/groups/[groupId]` — standings + read-only matches; `generateStaticParams` A–L
- Standings from `useTournamentDerived()` (not static JSON alone)

**Checkpoint 4:** 12 group routes build statically.

---

## Phase 5: Fixtures (replaces Predictions Core) ✅

*Original plan: Tasks 11–13 → `/predict`, `/predict/groups`, `/predict/knockout`.*

### Task 7b — `/fixtures` ✅
- Tabs A–L; 6 `PredictionMatchCard` per group
- Matches sorted by kickoff within group (`loadFixturesBundle`)
- Layout: teams · time · teams; meta + scores below
- `submitMatchPrediction` action + `useOptimisticMatchPrediction`
- `FixturesDataGate` + `use(loadFixturesBundle())`

**Checkpoint 5 (revised):** Enter scores → standings update via selectors → header 72 pill advances → persist on refresh.

---

## Phase 6: Bracket ✅

### Task 8–9 — Bracket tree + page ✅
- `KnockoutBracket`, `BracketRound`, `BracketMatch`, `BracketConnector`
- `/brackets` — R32 from `r32Matchups` when `isGroupStageComplete`
- **Editable** knockout picks (not separate `/predict/knockout`)
- Lock state + CTA to `/fixtures` when incomplete
- `/bracket` → redirect `/brackets`
- `BracketsDataGate` + Suspense skeleton
- Print styles

**Checkpoint 5:** 72/72 → R32 populated → knockout clicks persist.

---

## Phase 7: Leaderboard ✅

### Task 10 ✅
- `LeaderboardTable`, `useOptimisticLeaderboard`
- User row from `computeLeaderboardEntries` vs `results.json`
- Ref callback scroll to user row (no `useEffect`)
- `LeaderboardDataGate` + Suspense

---

## Phase 8: Community ✅

### Task 11 ✅
- `CommunityPickBar`, `ActivityFeed`, `TopPredictors`
- `/community`

---

## Phase 9: Profile ✅

### Task 12 ✅
- Stats (**72** group predictions, R32 count, etc.)
- `ProfileNameForm` — `useActionState(updateDisplayNameAction)`
- `PredictionSummary`, print styles

**Checkpoint 6:** All **8** primary routes render; build + tsc pass.

---

## Phase 10: Polish ✅

### Tasks 13–15 ✅
- `PageWrapper` + `useReducedMotion`
- Standings `layout` animation; bracket `AnimatePresence`
- Responsive 320–1440; bracket horizontal scroll; 44px touch targets
- A11y: aria on scores, flags, community live region
- Lighthouse ~96–97 on `/` and `/community` (polish pass)

**Final checkpoint:** SPEC §15 success criteria met except deferred routes.

---

## Deferred Work (original plan, not implemented)

| Original task | Planned deliverable | Status |
|---|---|---|
| 7–8 | `/teams`, `/teams/[teamId]` | Deferred |
| 13 | `/predict` hub + `predict/layout` | Replaced by `/fixtures` + dashboard CTAs |
| 12 (old) | `/predict/groups` | → `/fixtures` |
| 15 (partial) | `/predict/knockout` | → `/brackets` (editable) |
| 16 | `/schedule` date-grouped view | Deferred |
| — | Date-grouped fixtures like FIFA screenshots | Optional follow-up |

---

## Risks and Mitigations (retrospective)

| Risk | Outcome |
|---|---|
| shadcn + Tailwind v4 | Resolved — token override in `globals.css` |
| Zustand persist hydration | Resolved — `useHydrated()` convention |
| 48 vs 72 matches | Plan updated; `GROUP_MATCH_COUNT = 72` |
| Wrong kickoff order | Fixed — FIFA schedule regen + sort by `date` in loaders |
| `tournament.store` drift | Avoided — selectors + optimistic provider |
| Bracket layout (R32 = 16) | `bracketSlot` in data + horizontal scroll on mobile |

---

## Parallelization (historical)

For a greenfield replay with current scope:

| Track A | Track B | After |
|---|---|---|
| Fixtures + ScoreInput | Groups read-only pages | Checkpoint 2 |
| Bracket UI | Leaderboard | Fixtures checkpoint |
| Community | Profile | Bracket checkpoint |
| Motion | Responsive | All pages |

A11y pass last.

---

## Summary Table

| Phase | TASKS.md | Routes / artifacts |
|---|---|---|
| 1 Foundation | 1–3 | Types, JSON, lib, stores, actions |
| 2 Shell | 4 | Layout, nav, providers |
| 3 Landing | 5 | `/` |
| 4 Groups | 6–7 | `/groups`, `/groups/[id]` |
| 5 Fixtures | 7b | `/fixtures` |
| 6 Bracket | 8–9 | `/brackets`, `/bracket` redirect |
| 7 Leaderboard | 10 | `/leaderboard` |
| 8 Community | 11 | `/community` |
| 9 Profile | 12 | `/profile` |
| 10 Polish | 13–15 | Motion, responsive, a11y |

**Delivered routes:** `/`, `/fixtures`, `/groups`, `/groups/[groupId]`, `/brackets`, `/bracket` (redirect), `/leaderboard`, `/community`, `/profile`.

---

## Mapping: Original 21-task plan → Shipped

| Old # | Old focus | Shipped as |
|---|---|---|
| 1–4 | Foundation | Same (+ `match-display`, `r32-slots`, selectors) |
| 5–6 | Shell + stores | Shell + 2 stores + selectors (no tournament.store) |
| 7–8 | Teams | **Deferred** |
| 9–10 | Groups | Done (read-only + Suspense) |
| 11 | ScoreInput | `ScoreInput` + `PredictionMatchCard` |
| 12 | `/predict/groups` | **`/fixtures`** |
| 13 | `/predict` hub | **Dashboard CTAs** |
| 14–15 | Bracket + knockout page | **`/brackets`** (editable) |
| 16 | Schedule | **Deferred** |
| 17 | Leaderboard | Done (+ optimistic) |
| 18 | Dashboard | Done (+ React 19 onboarding) |
| 19–21 | Polish | Done |

For authoritative behavior and file paths, use **`docs/SPEC.md`**. For checkbox tracking, use **`docs/TASKS.md`**.
