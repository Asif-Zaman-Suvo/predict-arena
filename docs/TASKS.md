# Tasks: FIFA World Cup 2026 Predictor — Frontend

**Status:** Implemented · **Spec:** `docs/SPEC.md` · **Plan:** `docs/PLAN.md`  
**Date:** 2026-05-30 (updated to match codebase)

---

## Scope Notes (implemented)

### Routes delivered
| Route | Status |
|---|---|
| `/` | Done |
| `/fixtures` | Done — **primary prediction surface** |
| `/groups`, `/groups/[groupId]` | Done — read-only derived standings |
| `/brackets` | Done — derived R32 + editable knockout picks |
| `/bracket` | Redirect → `/brackets` |
| `/community` | Done |
| `/profile` | Done |

### Removed
- `/leaderboard` — page, components, selectors, hook, nav links (2026-05-30)

### Not built (deferred)
- `/predict`, `/predict/groups`, `/predict/knockout`
- `/schedule`, `/teams`, `/teams/[teamId]`

### Architecture (as built)
- **72** group-stage matches; progress pill `X / 72`.
- Predictions start **empty** (`null` per match).
- **`tournament.selectors.ts`** + `useTournamentDerived()` — no `tournament.store`.
- **Fixtures-first** score entry; groups/brackets derived.
- **Onboarding gate** — display name required before non-home routes.
- **React 19:** actions, `useOptimistic`, `useActionState`, Suspense + `use()`.
- `leaderboard.json` — community mock users only (not a route).

---

## Dependency Graph (completed)

```
[T1] Deps + design system ✅
        │
[T2] Types + mock data ✅
        │
[T3] Lib + Zustand + hydration + selectors ✅
        │
[T4] Layout shell + onboarding gate ✅
        │
        ├── [T5]  Landing + onboarding ✅
        ├── [T6]  Group + match primitives ✅
        │       └── [T7]  Groups pages ✅
        ├── [T7b] Fixtures page ✅
        ├── [T8]  Bracket components ✅
        │       └── [T9]  Brackets page ✅
        ├── [T11] Community ✅
        ├── [T12] Profile ✅
        └── [T13–T15] Polish ✅
```

---

## Tasks

### Phase 1: Foundation

#### Task 1 — Design system ✅
#### Task 2 — Types + mock data ✅
- [x] Types: `tournament`, `predictions`, `leaderboard` (community seeds), `community`
- [x] `leaderboard.json` — mock users for community (no leaderboard route)

#### Task 3 — Lib + stores ✅
- [x] `tournament.selectors.ts`, `persist-hydration.ts`
- [x] `scoring.ts` — profile score only
- [x] No `leaderboard.selectors.ts` (removed)

---

### Phase 2: Layout Shell

#### Task 4 — Layout + nav ✅
- [x] Nav: Home, Fixtures, Groups, Brackets, Community, Profile
- [x] `OnboardingGate`, `GuardedLink`

---

### Phase 3: Landing ✅

#### Task 5 — Landing + onboarding ✅
- [x] Quick-access: Fixtures, Groups, Brackets, Community (no Leaderboard)
- [x] Non-dismissible `OnboardingDialog`

---

### Phase 4–5: Groups + Fixtures ✅

#### Tasks 6–7, 7b ✅

---

### Phase 6: Bracket ✅

#### Tasks 8–9 ✅

---

### Phase 7: Leaderboard — REMOVED

#### Task 10 — ~~Leaderboard page~~ ❌ Removed
- Removed `/leaderboard`, `LeaderboardTable`, `useOptimisticLeaderboard`, selectors
- Profile keeps **Your Score** only (no rank vs seeded users)
- Community `TopPredictors` — no link to leaderboard

---

### Phase 8: Community ✅

#### Task 11 ✅
- [x] Uses `leaderboard.json` for Top Predictors + activity user lookup

---

### Phase 9: Profile ✅

#### Task 12 ✅
- [x] Stats: group progress, R32, best 3rd, **Your Score** (no rank)

---

### Phase 10: Polish ✅

#### Tasks 13–15 ✅
- [x] Motion (no leaderboard row animation)

---

### Final Checkpoint ✅

- [x] **7** primary routes
- [x] Build + tsc pass
- [x] Onboarding gate enforced

---

## Summary Table

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Design system | ✅ | |
| 2 | Types + data | ✅ | `leaderboard.json` = community only |
| 3 | Lib + stores | ✅ | No leaderboard selectors |
| 4 | Layout + gate | ✅ | No leaderboard nav |
| 5 | Landing | ✅ | 4 quick links |
| 6 | Primitives | ✅ | |
| 7 | Groups | ✅ | |
| 7b | Fixtures | ✅ | |
| 8–9 | Bracket | ✅ | |
| 10 | Leaderboard | ❌ | **Removed** |
| 11 | Community | ✅ | |
| 12 | Profile | ✅ | Score only |
| 13–15 | Polish | ✅ | |

---

## Optional follow-ups

- [ ] `/schedule`, `/teams`
- [ ] `/predict` hub
- [ ] Rename `leaderboard.json` → `predictors.json` (cosmetic)
