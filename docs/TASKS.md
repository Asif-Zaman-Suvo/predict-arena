# Tasks: FIFA World Cup 2026 Predictor — Frontend

**Status:** Implemented · **Spec:** `docs/SPEC.md` · **Plan:** `docs/PLAN.md`  
**Date:** 2026-05-30 (updated to match codebase)

---

## Scope Notes (implemented)

### Routes delivered
| Route | Status |
|---|---|
| `/` | Done |
| `/fixtures` | Done — **primary prediction surface** (replaces `/predict/groups`) |
| `/groups`, `/groups/[groupId]` | Done — read-only derived standings |
| `/brackets` | Done — derived R32 + editable knockout picks |
| `/bracket` | Redirect → `/brackets` |
| `/leaderboard` | Done |
| `/community` | Done |
| `/profile` | Done |

### Not built (deferred)
- `/predict`, `/predict/groups`, `/predict/knockout`
- `/schedule`, `/teams`, `/teams/[teamId]`

### Architecture (as built)
- **72** group-stage matches (not 48); progress pill shows `X / 72`.
- Predictions start **empty** (`null` per match), not seeded from `sample-predictions.json`.
- **`tournament.selectors.ts`** + `useTournamentDerived()` — no `tournament.store`.
- **Fixtures-first:** only `/fixtures` writes group scores; `/groups` and `/brackets` are derived/read-only (+ knockout clicks).
- **React 19:** actions, `useOptimistic`, `useActionState`, Suspense + `use()` loaders.
- Official FIFA WC26 kickoff times/venues in `matches.json` / `schedule.json`.

---

## Dependency Graph (completed)

```
[T1] Deps + design system ✅
        │
[T2] Types + mock data ✅
        │
[T3] Lib + Zustand + hydration + selectors ✅
        │
[T4] Layout shell ✅
        │
        ├── [T5]  Landing + onboarding ✅
        ├── [T6]  Group + match primitives ✅
        │       └── [T7]  Groups pages ✅
        ├── [T8]  Bracket components ✅
        │       └── [T9]  Brackets page ✅
        ├── [T10] Leaderboard ✅
        ├── [T11] Community ✅
        ├── [T12] Profile ✅
        └── [T13–T15] Polish ✅
```

---

## Tasks

### Phase 1: Foundation

#### Task 1 — Install dependencies and configure design system ✅

- [x] `zustand`, `framer-motion` in `package.json`
- [x] shadcn init → `src/components/ui/`
- [x] `globals.css` — navy/gold tokens
- [x] `npm run build` succeeds

---

#### Task 2 — TypeScript types and all mock data JSON files ✅

- [x] Types: `tournament`, `predictions`, `leaderboard`, `community`
- [x] `teams.json` — 48 teams
- [x] `groups.json` — 12 groups
- [x] `matches.json` — **72** group + knockout records (**104** total)
- [x] `schedule.json` — **18** venues
- [x] `leaderboard.json`, `results.json`
- [x] `community-picks.json`, `community-feed.json`
- [x] `sample-predictions.json` — reference only (not store seed)
- [x] `src/data/index.ts` barrel with `satisfies`

---

#### Task 3 — Utility functions and Zustand stores ✅

- [x] `lib/utils.ts`, `lib/tournament.ts`, `lib/scoring.ts`, `lib/bracket.ts`, `lib/r32-slots.ts`, `lib/match-display.ts`
- [x] `predictions.store` — persist `pa:predictions` v2; `null` = unpredicted
- [x] `user.store` — persist `pa:user`
- [x] **`tournament.selectors.ts`** — `useTournamentDerived()` (replaces `tournament.store`)
- [x] `leaderboard.selectors.ts`, `persist-hydration.ts` / `useHydrated()`
- [x] `src/actions/predictions.ts`, `src/actions/user.ts`
- [x] No hydration mismatch warnings

---

### Checkpoint 1 — Foundation ✅

- [x] Build + tsc pass
- [x] Design tokens visible
- [x] JSON + stores wired

---

### Phase 2: Layout Shell

#### Task 4 — Root layout, SiteHeader, MobileNav, SiteFooter ✅

- [x] `app/layout.tsx` + `AppProviders` / `PredictionsOptimisticProvider`
- [x] Nav: Home, **Fixtures**, Groups, **Brackets**, Leaderboard, Community, Profile
- [x] Progress pill: `{completed} / 72`
- [x] Mobile Sheet nav; active route indicator
- [x] `SiteFooter`, `PageWrapper`

---

### Checkpoint 2 — Shell ✅

---

### Phase 3: Landing Page

#### Task 5 — Landing page and onboarding modal ✅

- [x] Hero + countdown (June 11 2026)
- [x] Progress card (group + knockout)
- [x] Quick-access cards
- [x] `OnboardingDialog` — `useActionState(completeOnboardingAction)`
- [x] Persist onboarding via `user.store`

---

### Checkpoint 3 — Landing ✅

---

### Phase 4: Groups Pages

#### Task 6 — Group primitive components ✅

- [x] `TeamFlag`, `MatchCard` (kickoff time + `formatMatchMeta`)
- [x] `PredictionMatchCard` + `ScoreInput` (optimistic + pending state)
- [x] `GroupCard`, `AdvancementIndicator`

---

#### Task 7 — GroupStandingsTable, /groups, /groups/[groupId] ✅

- [x] `GroupStandingsTable`, `GroupGrid`, skeletons
- [x] `/groups` — `GroupsDataGate` + Suspense
- [x] `/groups/[groupId]` — standings + read-only matches
- [x] `useTournamentDerived()` for standings
- [x] `generateStaticParams` A–L

---

### Checkpoint 4 — Groups ✅

---

### Phase 5: Fixtures (replaces predict/groups scope)

#### Task 7b — Fixtures page ✅ *(implementation addition)*

- [x] `/fixtures` — tabs A–L, 6 `PredictionMatchCard` per group
- [x] Sorted by kickoff time within group
- [x] `FixturesDataGate` + `loadFixturesBundle()` + `use()`
- [x] `useOptimisticMatchPrediction` + `submitMatchPrediction` action
- [x] Single-column match list layout

*Original TASKS doc referenced `/predict/groups`; implemented as `/fixtures`.*

---

### Phase 6: Bracket

#### Task 8 — Bracket component tree ✅

- [x] `KnockoutBracket`, `BracketRound`, `BracketMatch`, `BracketConnector`
- [x] Horizontal scroll + reduced motion
- [x] `AnimatePresence` on team names

---

#### Task 9 — Brackets page ✅

- [x] `/brackets` — `BracketPageContent`
- [x] R32 from `useTournamentDerived().r32Matchups`
- [x] **Editable** knockout when `isGroupStageComplete`
- [x] Champion callout, print styles
- [x] `/bracket` → redirect `/brackets`
- [x] `BracketsDataGate` + Suspense skeleton

*Differs from original “read-only bracket seeded from sample data” — bracket is driven by user predictions.*

---

### Checkpoint 5 — Bracket ✅

---

### Phase 7: Leaderboard

#### Task 10 — Leaderboard components and /leaderboard page ✅

- [x] `LeaderboardRow`, `LeaderboardTable`
- [x] `useOptimisticLeaderboard` + `computeLeaderboardEntries`
- [x] User row highlight; ref scroll (no `useEffect`)
- [x] `LeaderboardDataGate` + Suspense
- [x] Mobile column collapse via layout

---

### Phase 8: Community

#### Task 11 — Community page ✅

- [x] `CommunityPickBar`, tabs A–L
- [x] `ActivityFeed`, `ActivityItem`, show more
- [x] `TopPredictors`
- [x] `/community`

---

### Phase 9: Profile

#### Task 12 — Profile page ✅

- [x] Avatar, stats grid (**72** group predictions, R32 count, etc.)
- [x] `ProfileNameForm` — `useActionState(updateDisplayNameAction)`
- [x] `PredictionSummary`
- [x] Print styles

---

### Checkpoint 6 — All Pages ✅

- [x] All **8** primary routes render
- [x] Build + tsc pass
- [x] Predictions persist on refresh

---

### Phase 10: Polish

#### Task 13 — Framer Motion animations ✅

- [x] `PageWrapper` fade-in + `useReducedMotion`
- [x] `GroupStandingsTable` layout animation
- [x] Bracket name transitions
- [x] Leaderboard row entrance

---

#### Task 14 — Responsive audit ✅

- [x] 320px–1440px pass
- [x] Bracket horizontal scroll + hint
- [x] Fixtures tabs scroll
- [x] 44px touch targets on score controls

---

#### Task 15 — Accessibility audit ✅

- [x] Tab order, aria labels, flags `role="img"`
- [x] Community `aria-live`, pick bar labels
- [x] Lighthouse ~96–97 on `/` and `/community` (polish pass)

---

### Final Checkpoint ✅

- [x] Core product flows work end-to-end
- [x] Build + tsc clean
- [x] Onboarding once per user
- [x] Docs updated to match implementation

---

## Summary Table

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Design system | ✅ | |
| 2 | Types + data | ✅ | 72 group matches |
| 3 | Lib + stores + selectors | ✅ | No tournament.store |
| 4 | Layout | ✅ | Fixtures in nav |
| 5 | Landing + onboarding | ✅ | useActionState |
| 6 | Primitives | ✅ | PredictionMatchCard |
| 7 | Groups pages | ✅ | Read-only |
| 7b | Fixtures page | ✅ | Main prediction UI |
| 8 | Bracket UI | ✅ | |
| 9 | Brackets page | ✅ | Editable knockout |
| 10 | Leaderboard | ✅ | Optimistic |
| 11 | Community | ✅ | |
| 12 | Profile | ✅ | |
| 13–15 | Polish | ✅ | |

---

## Optional follow-ups (not in scope)

- [ ] `/schedule` date-grouped schedule view
- [ ] `/teams` catalog + team profiles
- [ ] `/predict` hub (if separate from fixtures is desired)
- [ ] Full FIFA 495 third-place combination table (current: greedy assignment)
