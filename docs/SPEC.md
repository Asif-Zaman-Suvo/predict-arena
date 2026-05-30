# Spec: FIFA World Cup 2026 Predictor — Frontend UI

**Status:** Implemented (aligned with codebase as of 2026-05-30) · **Author:** Frontend Team

---

## 1. Objective

Build a single-user FIFA World Cup 2026 prediction web app. The user predicts **group-stage match scores** on `/fixtures`; standings, best-third ranking, and Round of 32 slots derive automatically. Knockout winners are picked on `/brackets`.

**User:** A football fan filling out a prediction bracket before the tournament.

**Success looks like:**
- User can predict all **72** group-stage match scores in one place (`/fixtures`).
- Standings and R32 matchups update from predictions (no manual qualifier picking).
- User can pick knockout winners when the group stage is complete.
- Fast, polished, mobile-usable UI with persisted predictions.

---

## 2. Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.2.6 (App Router) | Server + Client Components |
| Language | TypeScript 5, strict mode | |
| Styling | Tailwind CSS 4 | `@import "tailwindcss"` + shadcn CSS variables |
| Components | shadcn/ui | `src/components/ui/` |
| State | Zustand 5 + persist | `predictions.store`, `user.store` |
| Animation | Framer Motion 12 | PageWrapper, bracket, standings |
| Icons | Lucide React | |
| Data | Static JSON in `src/data/` | No `fetch()`, no API |

**React 19 patterns (implemented):**
- **Actions** — `src/actions/predictions.ts`, `src/actions/user.ts` (mock delay + Zustand writes).
- **`useOptimistic`** — score updates via `PredictionsOptimisticProvider`.
- **`useActionState`** — onboarding + profile name edit.
- **Suspense + `use()`** — fixtures/groups data gates (`src/data/loaders.ts`).
- **Derived state** — `useTournamentDerived()` (no `tournament.store`).
- **Hydration** — `usePersistHydrated()` via `useSyncExternalStore` on Zustand persist.

**Rendering:**
- Pages default to Server Components where possible.
- Client: Zustand, events, Framer Motion, optimistic hooks, all prediction UI.

---

## 3. Commands

```
Install:     npm install
Dev:         npm run dev          → http://localhost:3000
Build:       npm run build
Type check:  npx tsc --noEmit
Lint:        npm run lint
```

---

## 4. Project Structure (implemented)

```
predict-arena/
├── app/
│   ├── layout.tsx              # Root layout + AppProviders
│   ├── page.tsx                # / — Dashboard
│   ├── fixtures/page.tsx       # /fixtures — group score entry (main)
│   ├── groups/
│   │   ├── page.tsx
│   │   └── [groupId]/page.tsx
│   ├── brackets/page.tsx       # /brackets — knockout bracket
│   ├── bracket/page.tsx        # redirect → /brackets
│   ├── community/page.tsx
│   └── profile/page.tsx
│
├── src/
│   ├── actions/                # React 19 form actions
│   ├── components/
│   │   ├── fixtures/           # FixturesPageContent, DataGate, skeleton
│   │   ├── groups/
│   │   ├── matches/            # MatchCard, PredictionMatchCard
│   │   ├── predictions/        # ScoreInput, PredictionSummary
│   │   ├── bracket/
│   │   ├── community/
│   │   ├── profile/
│   │   ├── layout/               # OnboardingGate, GuardedLink, …
│   │   ├── providers/          # AppProviders, PredictionsOptimisticProvider
│   │   └── ui/
│   ├── data/                   # JSON + loaders.ts
│   ├── hooks/                  # useOptimisticPredictions
│   ├── lib/                    # tournament, scoring, bracket, match-display, r32-slots
│   ├── stores/
│   │   ├── predictions.store.ts
│   │   ├── user.store.ts
│   │   ├── tournament.selectors.ts
│   │   └── persist-hydration.ts
│   └── types/
│
└── docs/
    ├── SPEC.md
    ├── PLAN.md
    └── TASKS.md
```

**Deferred (not in repo):** `/predict/*`, `/schedule`, `/teams`, `/teams/[teamId]`, `/leaderboard` (removed).

---

## 5. Route Map (implemented)

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Countdown, progress, quick links |
| `/fixtures` | **Fixtures** | **Only** place to enter group scores (tabs A–L, 6 matches each) |
| `/groups` | Groups overview | Read-only standings grid from predictions |
| `/groups/[groupId]` | Group detail | Standings + read-only match cards with scores |
| `/brackets` | Knockout bracket | R32 derived from groups; click to pick winners when stage complete |
| `/bracket` | Redirect | → `/brackets` |
| `/community` | Community | Pick %, activity feed, top predictors |
| `/profile` | Profile | Stats (incl. score vs mock results), edit name, prediction summary |

**Navigation (SiteHeader):** Home · Fixtures · Groups · Brackets · Community · Profile

**Onboarding:** Display name required before leaving `/` (`OnboardingGate` + `GuardedLink`).

**Constraints:**
- R32 bracket slots populate only when **all 72** group matches have explicit predictions (`null` ≠ predicted).
- Per-group standings compute only when **all 6** matches in that group are predicted.
- `generateStaticParams` on `/groups/[groupId]` for A–L.

---

## 6. Data Model

### Teams & groups
- **48 teams**, **12 groups** (A–L), **4 teams** per group (`teams.json`, `groups.json`).

### Matches (`matches.json`)
- **72** group-stage matches (6 per group).
- **32** knockout slot records (R32 → final) with `bracketSlot`; team IDs often `null` until derived/filled.
- **104** total match records.
- Kickoff: ISO 8601 `date` with offset; display via `formatKickoffTime(date, venue.timezone)` in venue local time (24h).

### Venues (`schedule.json`)
- **18** FIFA-style venue names (USA/Canada/Mexico), including Houston (`nrg`) and Seattle (`lumen`).

### Other JSON
| File | Purpose |
|---|---|
| `results.json` | Mock final scores for **group** matches (profile score via `scoring.ts`) |
| `leaderboard.json` | 20 seeded mock users for **community** (Top Predictors, activity avatars) — no `/leaderboard` route |
| Community picks | Computed at runtime from seeded users + your predictions (`lib/community-predictions.ts`) |
| `community-feed.json` | Mock activity items |
| `sample-predictions.json` | Reference only; **not** used to seed the live store |

### Predictions store shape
```ts
matchPredictions: Record<matchId, { homeScore, awayScore } | null>  // null = not predicted
knockoutPredictions: Record<matchId, teamId | null>
```
Persist key `pa:predictions` (v2). Empty predictions use `null`, not `0-0`, until the user sets a score.

---

## 7. Architecture: Predictions → Derived State

```
/fixtures (score entry, optimistic UI + actions)
        ↓
predictions.store (persisted)
        ↓
computeTournamentDerived() / useTournamentDerived()
  - groupStandings, groupComplete, isGroupStageComplete
  - bestThirdPlaceRanking, r32Matchups (FIFA-style slot map in r32-slots.ts)
        ↓
/groups (read-only)     /brackets (derived R32 + knockout picks)
```

No `tournament.store` and no `useEffect` sync between stores.

---

## 8. Zustand Stores

### `predictions.store.ts`
- `setPrediction`, `clearPrediction`, `setKnockoutPrediction`
- Clears `knockoutPredictions` when group stage is incomplete
- Persist: `pa:predictions`

### `user.store.ts`
- `displayName`, `avatarSeed`, `hasOnboarded`
- Persist: `pa:user`

### `tournament.selectors.ts` (not persisted)
- `computeTournamentDerived(matchPredictions)`
- `useTournamentDerived()` — reads **optimistic** predictions from `PredictionsOptimisticProvider`

### Hydration
- `useHydrated()` / `usePersistHydrated()` — both stores must rehydrate before showing persisted UI

---

## 9. Key Components

| Component | Role |
|---|---|
| `PredictionMatchCard` | Horizontal row: teams · **kickoff time** · teams; metadata line; `ScoreInput` below |
| `ScoreInput` | ± buttons, 0–99; `aria-busy` when action pending |
| `MatchCard` | Read-only; same layout as prediction card + score or score under time |
| `GroupGrid` / `GroupCard` | Overview standings |
| `GroupStandingsTable` | Full table; motion `layout` on rows |
| `KnockoutBracket` | 6 rounds; editable when `isGroupStageComplete` |
| `OnboardingDialog` | `useActionState(completeOnboardingAction)`; non-dismissible until name set |
| `OnboardingGate` | Redirect + block routes until onboarding complete |
| `ProfileNameForm` | `useActionState(updateDisplayNameAction)` |

**Display helpers:** `src/lib/match-display.ts` — `formatKickoffTime`, `formatMatchMeta`, `formatVenueLine`.

---

## 10. User Flows (implemented)

### First visit
`/` → onboarding (display name, required) → dashboard with 0/72 progress → CTA to `/fixtures`.

### Group predictions
`/fixtures` → tab Group A–L → change scores → optimistic UI → persist → header pill updates.

### Standings & bracket
`/groups` shows derived standings (placeholders until group complete).  
`/brackets` locked until 72/72; then R32 auto-filled; click teams for knockout rounds.

### Profile score
`/profile` — **Your Score** from `computeUserScore()` vs `results.json` (group stage only).

---

## 11. Design System

Unchanged from original spec: navy/gold tokens in `globals.css`, Geist fonts, max width `1280px`, Framer Motion principles with `useReducedMotion` in `PageWrapper`.

---

## 12. Accessibility (WCAG 2.1 AA target)

- Keyboard-accessible score controls and bracket selection
- `ScoreInput` / `BracketMatch` aria labels per spec patterns
- `TeamFlag` → `role="img"`
- Advancement: color + icon + text
- Onboarding dialog focus + `useActionState` error display
- Target: Lighthouse a11y ≥ 90 on `/` and `/community` (verified in polish pass)

---

## 13. Scoring (`src/lib/scoring.ts`)

Used on **profile** only (no leaderboard page):
- Exact score: 3 pts · Correct result: 1 pt (knockout not scored in mock data)

---

## 14. Boundaries

**Always:**
- `'use client'` where required
- Static JSON only — no `fetch()`
- TypeScript strict
- `useHydrated()` before persisted store reads in UI

**Never:**
- Backend / API
- Seeding live predictions from `sample-predictions.json` on first visit (empty `null` state by design)

---

## 15. Success Criteria (implementation)

- [x] Predict all **72** group-stage matches on `/fixtures`
- [x] Standings derive from predictions; per-group complete when 6/6 predicted
- [x] R32 unlocks after 72/72; derived from standings + best 8 thirds
- [x] Knockout winner picks on `/brackets`
- [x] Community + profile surfaces
- [x] Onboarding gates all routes until display name set
- [x] Predictions persist (`localStorage`)
- [x] Functional at 320px; bracket horizontal scroll on mobile
- [x] `npm run build` and `tsc` pass
- [ ] `/schedule` and `/teams` (deferred)
- [ ] Separate `/predict` hub (replaced by `/fixtures`)
- [x] `/leaderboard` removed (2026-05-30)

---

## 16. Changelog vs original draft spec

| Original | Implemented |
|---|---|
| 48 group matches | **72** (6 per group, FIFA 2026 format) |
| `/predict/groups` | **`/fixtures`** |
| `/predict/knockout` | Knockout on **`/brackets`** |
| `tournament.store` | **`tournament.selectors.ts`** |
| Sample predictions seed store | **Empty `null`** predictions until user input |
| Read-only `/bracket` | **Editable** knockout when group stage complete |
| `/leaderboard` page | **Removed** — score on profile; `leaderboard.json` for community mock users only |
| `/teams`, `/schedule` | Not built |
