# Implementation Plan: FIFA World Cup 2026 Predictor — Frontend

**Status:** Implemented (aligned with codebase as of 2026-05-30)  
**Spec:** `docs/SPEC.md` · **Task checklist:** `docs/TASKS.md`

---

## Overview

Static-data, client-state prediction app delivered across **9 phases** (see `TASKS.md`). Uses **72** group matches, **`/fixtures`** as the sole score-entry surface, **`tournament.selectors.ts`** for derived state, and **React 19** actions/optimistic/Suspense patterns. **No `/leaderboard` route** — profile shows user score; `leaderboard.json` seeds community mock users only.

**Build verification:** `npm run build` and `npx tsc --noEmit` pass.

---

## Architecture Decisions (as built)

| Decision | Choice | Rationale |
|---|---|---|
| Group predictions | `/fixtures` only | Single surface; no `/predict` hub |
| Match count | **72** (6 × 12 groups) | FIFA 2026 format |
| Empty predictions | `null` per match | Distinct from `0-0`; progress = non-null count |
| Derived standings | `computeTournamentDerived()` + `useTournamentDerived()` | No `tournament.store`, no `useEffect` sync |
| Optimistic UI | `PredictionsOptimisticProvider` + actions | One provider at layout; per-card hooks |
| Data loading | `src/data/loaders.ts` + Suspense gates | `use()` on fixtures/groups bundles |
| Bracket R32 | Derived from standings + best 8 thirds | `r32-slots.ts` FIFA-style slot map |
| Knockout picks | Editable on `/brackets` when 72/72 | Replaces `/predict/knockout` |
| Onboarding | `OnboardingGate` + `GuardedLink` | Display name required before other routes |
| Scoring | `scoring.ts` on profile only | No leaderboard page |
| Community users | `leaderboard.json` | Mock predictors for feed + Top Predictors |
| shadcn + Tailwind v4 | CSS variables in `globals.css` | Validated in Phase 1 |
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
[4] App shell (layout, providers, nav, progress X/72, onboarding gate)
        │
        ├── [5]  Landing + onboarding (useActionState)
        ├── [6]  Match primitives (PredictionMatchCard, ScoreInput)
        │       ├── [7]  Groups pages (read-only, Suspense)
        │       └── [7b] Fixtures page (prediction + optimistic)
        ├── [8–9] Bracket UI + /brackets (+ /bracket redirect)
        ├── [10] Community
        └── [11] Profile (score via scoring.ts)
                │
        [12–14] Motion, responsive, a11y polish
```

**Deferred / removed:** Teams, Schedule, Predict hub; **`/leaderboard` removed**.

---

## Phase 1: Foundation ✅

### Tasks 1–4
- Design system, types, JSON (incl. `leaderboard.json` for community seeds), lib, stores, actions

**Checkpoint 1:** Build, tsc, JSON populated.

---

## Phase 2: App Shell ✅

### Task 4–6
- Nav: Home, Fixtures, Groups, Brackets, Community, Profile (no Leaderboard)
- `OnboardingGate`, `GuardedLink`, progress pill `X / 72`

**Checkpoint 2:** Shell + onboarding gate.

---

## Phase 3: Landing ✅

- Dashboard, quick links (4 cards), `OnboardingDialog`

---

## Phase 4: Groups ✅

- Read-only `/groups`, `/groups/[groupId]`

---

## Phase 5: Fixtures ✅

- `/fixtures` — primary prediction UI

---

## Phase 6: Bracket ✅

- `/brackets` editable knockout; `/bracket` redirect

---

## Phase 7: Community ✅

- `/community` — picks, feed, Top Predictors (from `leaderboard.json`)

---

## Phase 8: Profile ✅

- Stats grid, **Your Score** via `computeUserScore`, no global rank
- `ProfileNameForm`, `PredictionSummary`

**Checkpoint:** **7** primary routes; build + tsc pass.

---

## Phase 9: Polish ✅

- Motion, responsive, a11y

---

## Removed (2026-05-30)

| Item | Notes |
|---|---|
| `/leaderboard` route | Page, components, selectors, hook, loader deleted |
| `leaderboard.selectors.ts`, `lib/leaderboard.ts` | Removed |
| Nav / home quick link | Leaderboard entry removed |
| Profile rank stat | Removed with leaderboard |

**Kept:** `leaderboard.json` + `LeaderboardEntry` type for community mock data.

---

## Deferred Work

| Item | Status |
|---|---|
| `/teams`, `/teams/[teamId]` | Deferred |
| `/schedule` | Deferred |
| `/predict` hub | Replaced by `/fixtures` |

---

## Summary Table

| Phase | Routes / artifacts |
|---|---|
| 1 Foundation | Types, JSON, lib, stores, actions |
| 2 Shell | Layout, nav, onboarding gate |
| 3 Landing | `/` |
| 4 Groups | `/groups`, `/groups/[id]` |
| 5 Fixtures | `/fixtures` |
| 6 Bracket | `/brackets`, `/bracket` redirect |
| 7 Community | `/community` |
| 8 Profile | `/profile` |
| 9 Polish | Motion, responsive, a11y |

**Delivered routes:** `/`, `/fixtures`, `/groups`, `/groups/[groupId]`, `/brackets`, `/bracket` (redirect), `/community`, `/profile`.

For behavior detail, see **`docs/SPEC.md`**. For task checkboxes, see **`docs/TASKS.md`**.
