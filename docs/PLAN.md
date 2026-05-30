# Implementation Plan: FIFA World Cup 2026 Predictor — Frontend

**Spec reference:** `docs/SPEC.md`
**Date:** 2026-05-30

---

## Overview

Build a static-data, client-state-only prediction app in 21 tasks across 9 phases. The dependency graph runs types → mock data → lib functions → Zustand stores → primitive components → composite components → pages → polish. No phase can begin until the previous checkpoint passes.

---

## Architecture Decisions

- **Tailwind v4 + shadcn/ui risk**: shadcn/ui's CSS variable defaults are designed for Tailwind v3. We install shadcn with `--style default` and override all CSS variables in `globals.css` with the spec's design tokens immediately in Task 1. This is the highest-risk dependency — validate it before any UI work.
- **Zustand SSR hydration**: `persist` middleware causes hydration mismatch in App Router when the server renders with empty state and the client mounts with localStorage data. Every component reading persisted store state must use a `useHydrated()` guard or render a skeleton on first mount. This pattern is established in Task 6 and followed universally.
- **Bracket layout math**: The R32 round (16 matches) is new to 2026. Bracket layout positions are driven by a static `bracketSlot` field in `matches.json`, not computed — this decouples layout logic from advancement logic.
- **No data fetching**: All JSON files are imported directly. `generateStaticParams` uses the imported data to generate dynamic routes at build time.

---

## Dependency Graph

```
[Task 2] Types
    │
    ├── [Task 3] Mock Data JSON
    │       │
    │       └── [Task 4] lib/tournament.ts, lib/scoring.ts, lib/utils.ts
    │
[Task 1] Deps + Design System (globals.css + shadcn/ui)
    │
[Task 5] App Shell (Root layout, SiteHeader, SiteFooter, MobileNav)
    │
[Task 6] Zustand Stores (user, predictions, tournament)
    │
    ├── [Tasks 7-8]  Teams feature
    ├── [Tasks 9-10] Groups feature
    ├── [Tasks 11-13] Predictions core
    ├── [Tasks 14-15] Bracket feature
    ├── [Task 16]    Schedule page
    ├── [Task 17]    Leaderboard page
    └── [Task 18]    Dashboard + Onboarding
            │
            └── [Tasks 19-21] Polish (motion, responsive, a11y)
```

---

## Task List

---

### Phase 1: Foundation

---

#### Task 1: Install dependencies and configure design system

**Description:**
Install Zustand, Framer Motion, and shadcn/ui. Run shadcn init to generate the component scaffold. Immediately override all shadcn CSS variables in `globals.css` with the spec's design tokens (navy/gold palette). This must be done before any component work so the design system is correct from the first line of UI code.

**Acceptance criteria:**
- [ ] `zustand` and `framer-motion` are in `package.json` dependencies.
- [ ] shadcn/ui is initialized with Tailwind v4 path (`src/components/ui/` output).
- [ ] `globals.css` imports `tailwindcss` and defines all 10 spec color tokens as CSS custom properties.
- [ ] A single shadcn `Button` renders with the spec's gold accent color — not the default blue/purple.
- [ ] `npm run build` produces no errors.

**Verification:**
- [ ] Build: `npm run build`
- [ ] Type check: `npx tsc --noEmit`
- [ ] Manual: render a Button in `app/page.tsx` temporarily and confirm gold accent color in browser.

**Dependencies:** None

**Files touched:**
- `package.json`
- `app/globals.css`
- `components.json` (shadcn config)
- `src/components/ui/button.tsx` (generated)
- `src/components/ui/card.tsx` (generated)

**Estimated scope:** M

**Risk:** HIGH — shadcn/ui + Tailwind v4 CSS variable mapping. If shadcn's `--primary` overrides conflict with the v4 CSS layer order, the design token override strategy may need adjustment. Validate before proceeding.

---

#### Task 2: TypeScript type definitions

**Description:**
Write all shared TypeScript types. These are the contracts that every component, store, and utility function will use. Strict types here prevent cascading type errors in later tasks.

**Acceptance criteria:**
- [ ] `src/types/tournament.ts` exports: `Team`, `Group`, `Match`, `Standing`, `MatchStage`, `Venue`, `Confederation`.
- [ ] `src/types/predictions.ts` exports: `MatchPrediction`, `PredictionState`, `KnockoutPrediction`.
- [ ] `src/types/leaderboard.ts` exports: `LeaderboardEntry`.
- [ ] All types are `readonly` where appropriate; no `any`.
- [ ] `npx tsc --noEmit` passes with zero errors.

**Verification:**
- [ ] Type check: `npx tsc --noEmit`

**Dependencies:** Task 1

**Files touched:**
- `src/types/tournament.ts`
- `src/types/predictions.ts`
- `src/types/leaderboard.ts`

**Estimated scope:** S

---

#### Task 3: Mock data JSON files

**Description:**
Create all 5 static JSON files with real 2026 World Cup data: all 48 teams across 12 groups, all 48 group stage matches with correct dates/venues, full 16-venue schedule, and 20 seeded leaderboard users. Include a `data/results.json` with mock "final results" for the scoring engine. This is the only source of truth for all data in the app.

**Acceptance criteria:**
- [ ] `src/data/teams.json` has exactly 48 teams, each with all fields from the spec shape.
- [ ] `src/data/groups.json` has exactly 12 groups (A–L), each with exactly 4 `teamIds`.
- [ ] `src/data/matches.json` has exactly 48 group stage matches + 63 knockout slot entries (some with null teamIds).
- [ ] `src/data/schedule.json` has all 16 venues with correct city/country/timezone.
- [ ] `src/data/leaderboard.json` has exactly 20 entries with all spec fields.
- [ ] `src/data/results.json` has mock final scores for all 48 group matches (used only by scoring engine).
- [ ] All JSON validates against the TypeScript types from Task 2 (confirmed via a temporary import in `lib/utils.ts`).

**Verification:**
- [ ] Type check: `npx tsc --noEmit` (after importing JSON in utils.ts with `satisfies` check)

**Dependencies:** Task 2

**Files touched:**
- `src/data/teams.json`
- `src/data/groups.json`
- `src/data/matches.json`
- `src/data/schedule.json`
- `src/data/leaderboard.json`
- `src/data/results.json`

**Estimated scope:** M (data volume, not logic complexity)

---

#### Task 4: Utility and domain logic functions

**Description:**
Write three pure function modules. `lib/utils.ts` contains `cn()`, `formatDate()`, and `formatScore()`. `lib/tournament.ts` contains the group standings computation (points, GD, tiebreakers) and the "best third-place" advancement algorithm. `lib/scoring.ts` contains the point-scoring rules from the spec. All functions are pure with no side effects — they take data as arguments and return derived data.

**Acceptance criteria:**
- [ ] `lib/utils.ts` exports: `cn(ClassValue[]): string`, `formatDate(iso: string, tz?: string): string`, `formatScore(home: number, away: number): string`.
- [ ] `lib/tournament.ts` exports: `computeGroupStandings(groupId, matches, predictions): Standing[]`, `deriveAdvancementStatus(standings): Standing[]`, `getBestThirdPlaceTeams(allGroupStandings): string[]`.
- [ ] `lib/scoring.ts` exports: `computeUserScore(predictions, results): ScoreSummary`.
- [ ] Tiebreaker order in `computeGroupStandings` follows FIFA rules: points → GD → GF → head-to-head.
- [ ] All functions have JSDoc parameter/return documentation.
- [ ] `npx tsc --noEmit` passes.

**Verification:**
- [ ] Type check: `npx tsc --noEmit`
- [ ] Manual trace: mentally verify `computeGroupStandings` returns correctly sorted standings for a 4-team group where two teams are level on points.

**Dependencies:** Tasks 2, 3

**Files touched:**
- `src/lib/utils.ts`
- `src/lib/tournament.ts`
- `src/lib/scoring.ts`

**Estimated scope:** M

---

### Checkpoint 1: Foundation

- [ ] `npm run build` succeeds with zero errors.
- [ ] `npx tsc --noEmit` returns zero errors.
- [ ] shadcn Button renders with gold accent.
- [ ] All 6 JSON data files exist and are populated.
- [ ] All lib functions are typed and documented.

**Review with human before Phase 2.**

---

### Phase 2: App Shell

---

#### Task 5: Root layout, design shell, and navigation

**Description:**
Build the persistent app chrome: root `layout.tsx`, `SiteHeader` (sticky, active link highlighting, mobile hamburger), `MobileNav` (shadcn Sheet), and `SiteFooter`. The header includes a small `PredictionProgress` pill showing "X/48 predictions" that always reflects store state. This is the first task that renders visible UI.

**Acceptance criteria:**
- [ ] `app/layout.tsx` applies the `--color-pitch` background and Geist font globally.
- [ ] `SiteHeader` is sticky with the 8 primary nav links from the spec route map.
- [ ] Active route is visually distinguished (not just color — use an underline or border).
- [ ] Mobile hamburger renders `MobileNav` Sheet from the left; all nav links present; closes on route change.
- [ ] `SiteFooter` renders at the bottom of every page.
- [ ] Layout renders without console errors at all 5 breakpoints (320, 640, 768, 1024, 1440).
- [ ] Max content width is 1280px, centered.

**Verification:**
- [ ] Build: `npm run build`
- [ ] Manual: resize browser across all 5 breakpoints; tab through nav links.

**Dependencies:** Tasks 1, 2, 4 (for `cn()`)

**Files touched:**
- `app/layout.tsx`
- `src/components/layout/SiteHeader.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/components/layout/SiteFooter.tsx`

**Estimated scope:** M

---

#### Task 6: Zustand stores

**Description:**
Implement all three Zustand stores with persistence and the SSR hydration guard. The `predictions.store` and `user.store` persist to localStorage. The `tournament.store` is ephemeral — it recomputes from `predictions.store` using `lib/tournament.ts` whenever predictions change. Export a `useHydrated()` hook that components use before reading any persisted store state.

**Acceptance criteria:**
- [ ] `predictions.store.ts` has all state, actions, and derived selectors from the spec.
- [ ] `user.store.ts` has `displayName`, `avatarSeed`, `hasOnboarded`, and all actions.
- [ ] `tournament.store.ts` exposes `groupStandings` and `recomputeStandings()`.
- [ ] `predictions.store` persists to `localStorage["pa:predictions"]`; survives a full page refresh.
- [ ] `user.store` persists to `localStorage["pa:user"]`; survives a full page refresh.
- [ ] `tournament.store` is NOT persisted.
- [ ] A `useHydrated()` hook is exported from `src/stores/hydration.ts`; returns `false` on the initial server render and `true` after client mount.
- [ ] No React hydration mismatch warnings in the browser console.

**Verification:**
- [ ] Manual: set a prediction via browser console → `usePredictionsStore.getState().setPrediction(...)` → hard refresh → prediction persists.
- [ ] Manual: confirm no hydration warning in Chrome DevTools console.
- [ ] Type check: `npx tsc --noEmit`

**Dependencies:** Tasks 2, 4

**Files touched:**
- `src/stores/predictions.store.ts`
- `src/stores/user.store.ts`
- `src/stores/tournament.store.ts`
- `src/stores/hydration.ts`

**Estimated scope:** M

---

### Checkpoint 2: App Shell

- [ ] App loads at `http://localhost:3000` with full nav chrome.
- [ ] Nav is responsive — hamburger at mobile, full links at desktop.
- [ ] No console errors or hydration warnings.
- [ ] Stores persist correctly across hard refresh.

---

### Phase 3: Teams Feature

---

#### Task 7: Team components and teams grid page

**Description:**
Build the teams catalog. `TeamFlag` renders a country flag emoji with proper ARIA. `TeamCard` shows flag, team name, FIFA ranking, confederation badge, and group assignment. `TeamGrid` is the responsive 48-team grid. The `/teams` page reads directly from `data/teams.json` and renders the grid with a confederation filter UI.

**Acceptance criteria:**
- [ ] `TeamFlag` wraps emoji in `<span role="img" aria-label="{team.name} flag">`.
- [ ] `TeamCard` renders all 6 visible data fields and links to `/teams/[team.id]`.
- [ ] `TeamGrid` renders `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6`.
- [ ] Confederation filter (shadcn `Tabs` or `Select`) narrows the grid correctly.
- [ ] "No teams match your filter" empty state renders when filter matches zero teams.
- [ ] `/teams` page renders all 48 teams from the JSON without any `fetch()` call.

**Verification:**
- [ ] Build: `npm run build`
- [ ] Manual: open `/teams`; verify 48 cards render; filter by "UEFA" and confirm count is correct (≈ 16 teams).

**Dependencies:** Tasks 1, 2, 3, 5

**Files touched:**
- `src/components/teams/TeamFlag.tsx`
- `src/components/teams/TeamCard.tsx`
- `src/components/teams/TeamGrid.tsx`
- `app/teams/page.tsx`

**Estimated scope:** M

---

#### Task 8: Team detail page

**Description:**
Build the individual team profile page at `/teams/[teamId]`. Uses `generateStaticParams` to pre-generate all 48 team pages. Shows team flag (large), full name, confederation, FIFA ranking, group assignment, and all group matches for that team (from `data/matches.json`).

**Acceptance criteria:**
- [ ] `generateStaticParams` returns all 48 team IDs from `data/teams.json`.
- [ ] Page renders flag, name, confederation, FIFA ranking, group label.
- [ ] Page shows the team's 3 group matches with opponent flags and match dates.
- [ ] `notFound()` is called for any `teamId` not in the data.
- [ ] Breadcrumb: "Teams / Brazil" links back to `/teams`.

**Verification:**
- [ ] Build: `npm run build` — all 48 static pages generated.
- [ ] Manual: navigate to `/teams/brazil`; verify match list has 3 entries.
- [ ] Manual: navigate to `/teams/fake-id`; confirm 404 page renders.

**Dependencies:** Tasks 2, 3, 5, 7

**Files touched:**
- `app/teams/[teamId]/page.tsx`

**Estimated scope:** S

---

### Phase 4: Groups Feature

---

#### Task 9: Group card and groups overview page

**Description:**
Build `GroupCard` (the mini standings card shown in the 12-group grid) and the `/groups` page. Each group card shows the group letter, all 4 teams in current predicted order, and a link to the group detail page.

**Acceptance criteria:**
- [ ] `GroupCard` renders group letter, 4 team rows with flag + name + points (0 pts if no predictions yet).
- [ ] "Advances" indicator on top 2 rows (subtle — badge or dot, not only color).
- [ ] `GroupGrid` renders all 12 groups at `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- [ ] `/groups` page renders the grid from static JSON — no store reads (standings shown only after Task 12 connects stores).
- [ ] 12 skeleton cards render during the initial hydration guard window.

**Verification:**
- [ ] Build: `npm run build`
- [ ] Manual: open `/groups`; 12 cards render; each card links to `/groups/A` etc.

**Dependencies:** Tasks 1, 2, 3, 5, 7

**Files touched:**
- `src/components/groups/GroupCard.tsx`
- `src/components/groups/GroupGrid.tsx`
- `app/groups/page.tsx`

**Estimated scope:** M

---

#### Task 10: Match components and group detail page

**Description:**
Build `MatchCard`, `MatchDaySection`, and `MatchList` for displaying match data. Then build the `/groups/[groupId]` page showing the full `GroupStandingsTable` (animated via Framer Motion layout) and the 6 group matches. `generateStaticParams` covers all 12 groups.

**Acceptance criteria:**
- [ ] `MatchCard` renders home flag, home name, "vs", away name, away flag, formatted date, and venue name.
- [ ] `MatchDaySection` groups matches under a formatted date heading (e.g., "Thursday, Jun 11").
- [ ] `GroupStandingsTable` renders full points table (P W D L GF GA GD Pts) with advancement highlighting.
- [ ] Framer Motion `layout` prop on standing rows causes smooth reorder when predictions change (animation not yet connected — just the prop applied).
- [ ] `/groups/[groupId]` page renders without error for all 12 groups.
- [ ] `notFound()` for invalid `groupId` params.

**Verification:**
- [ ] Build: `npm run build` — 12 static group pages generated.
- [ ] Manual: open `/groups/A`; standings table and 6 match cards render correctly.

**Dependencies:** Tasks 2, 3, 5, 6, 9

**Files touched:**
- `src/components/matches/MatchCard.tsx`
- `src/components/matches/MatchDaySection.tsx`
- `src/components/matches/MatchList.tsx`
- `src/components/groups/GroupStandingsTable.tsx`
- `app/groups/[groupId]/page.tsx`

**Estimated scope:** L → Split completed by keeping `GroupStandingsTable` animation wiring to Task 19

---

### Checkpoint 3: Static Pages

- [ ] `/teams`, `/teams/[teamId]`, `/groups`, `/groups/[groupId]` all render correctly.
- [ ] `npm run build` generates 48 team pages + 12 group pages with no errors.
- [ ] No console errors at 320px, 768px, 1024px viewports.

---

### Phase 5: Predictions Core

---

#### Task 11: ScoreInput and PredictionCard components

**Description:**
Build the two interactive prediction primitives. `ScoreInput` is a single accessible score entry widget — two number inputs with increment/decrement buttons. `PredictionCard` combines a `MatchCard` with a `ScoreInput` and reads/writes to the `predictions.store`. This is the first component to use Zustand.

**Acceptance criteria:**
- [ ] `ScoreInput` renders two number inputs (0–99 clamp), two `+` buttons, two `−` buttons.
- [ ] `aria-label` on each input follows the spec format: "Home score for {homeTeam} vs {awayTeam}".
- [ ] Keyboard: Tab moves between inputs; `+`/`-` keys work on focused input.
- [ ] Score inputs show `0` as default, not empty.
- [ ] `PredictionCard` reads current prediction from store on mount (via `useHydrated()` guard).
- [ ] `PredictionCard` writes to store on input blur (not on every keystroke).
- [ ] No prediction is lost when navigating away and returning.

**Verification:**
- [ ] Manual: render `PredictionCard` on a test page; enter a score; navigate away; navigate back; score persists.
- [ ] Manual: Tab through score inputs; confirm focus is correct.
- [ ] Type check: `npx tsc --noEmit`

**Dependencies:** Tasks 1, 2, 3, 6

**Files touched:**
- `src/components/predictions/ScoreInput.tsx`
- `src/components/predictions/PredictionCard.tsx`

**Estimated scope:** M

---

#### Task 12: Group predictions form and predict/groups page

**Description:**
Build `GroupPredictionsForm` — the full prediction UI for one group's 6 matches. Build `PredictionProgress` — the progress bar component. Wire up the `/predict/groups` page with a tab-per-group navigation (tabs A–L) containing a `GroupPredictionsForm` per tab. The live standings sidebar updates as scores change.

**Acceptance criteria:**
- [ ] `/predict/groups` renders 12 tabs (A–L); each tab shows `GroupPredictionsForm` for that group.
- [ ] `GroupPredictionsForm` renders 6 `PredictionCard` components for the group's matches.
- [ ] A `GroupStandingsTable` sidebar (or below-form section on mobile) re-renders on each prediction change via `tournament.store`.
- [ ] `PredictionProgress` shows "X / 48 Group Stage predictions completed" with a shadcn `Progress` bar.
- [ ] Completing all 6 matches in a group triggers a subtle visual completion state on the tab.
- [ ] Page is fully functional at 320px (tabs scroll horizontally; single-column layout).

**Verification:**
- [ ] Manual: enter scores for all 6 Group A matches; confirm standings table reorders correctly.
- [ ] Manual: confirm progress bar advances from 0 to 6/48 after Group A predictions.
- [ ] Build: `npm run build`

**Dependencies:** Tasks 4, 6, 9, 10, 11

**Files touched:**
- `src/components/predictions/GroupPredictionsForm.tsx`
- `src/components/predictions/PredictionProgress.tsx`
- `app/predict/groups/page.tsx`

**Estimated scope:** M

---

#### Task 13: Predict hub page and predict sub-layout

**Description:**
Build the `/predict` entry page and the `predict/layout.tsx` sub-layout. The hub shows two stage cards (Group Stage, Knockout) with completion status and CTAs. The knockout card is locked (grayed out with a lock icon) until `isGroupStageComplete` is true. The sub-layout adds the `PredictionProgress` indicator above the predict route tree.

**Acceptance criteria:**
- [ ] `/predict` shows two stage cards with correct completion percentages from the store.
- [ ] Group Stage card CTA links to `/predict/groups`.
- [ ] Knockout card shows lock icon + "Complete all group predictions to unlock" when group stage is incomplete.
- [ ] Knockout card becomes active and links to `/predict/knockout` once all 48 group predictions are set.
- [ ] `predict/layout.tsx` renders `PredictionProgress` at the top of the predict section.
- [ ] Both cards are responsive (stack on mobile, side-by-side on md+).

**Verification:**
- [ ] Manual: with 0 predictions, confirm knockout card is locked.
- [ ] Manual: with 48 predictions, confirm knockout card is active.
- [ ] Build: `npm run build`

**Dependencies:** Tasks 6, 12

**Files touched:**
- `app/predict/page.tsx`
- `app/predict/layout.tsx`

**Estimated scope:** S

---

### Checkpoint 4: Group Predictions

- [ ] Complete prediction flow: `/predict` → `/predict/groups` → enter scores → standings update live → progress bar advances.
- [ ] Predictions survive hard page refresh.
- [ ] Knockout card locked state and unlock state both render correctly.
- [ ] No console errors or TypeScript errors.

---

### Phase 6: Knockout Bracket

---

#### Task 14: Bracket component tree

**Description:**
Build the full bracket visualization: `BracketConnector` (SVG lines), `BracketMatch` (one match slot), `BracketRound` (one column), and `KnockoutBracket` (full tree). The bracket is data-driven from `matches.json` bracket slots and `knockoutPredictions` store state. Team names fade-in/out via `AnimatePresence` when predictions change. On mobile, the bracket scrolls horizontally inside a `overflow-x-auto` container.

**Acceptance criteria:**
- [ ] `KnockoutBracket` renders 6 rounds: R32 (16 matches), R16 (8), QF (4), SF (2), 3rd-place (1), Final (1).
- [ ] `BracketMatch` shows two team slots; each slot shows flag + name (or "TBD" if unresolved).
- [ ] `BracketConnector` SVG lines correctly connect adjacent match slots within a round.
- [ ] `isEditable` prop controls whether clicking a slot opens team selection.
- [ ] Team names animate with `AnimatePresence` fade on change.
- [ ] Bracket is horizontally scrollable at 320px without breaking layout.
- [ ] Bracket is fully visible at 1024px+ (no horizontal scroll).

**Verification:**
- [ ] Manual: render bracket with all TBD slots; confirm 16 + 8 + 4 + 2 + 1 + 1 = 32 match slots visible.
- [ ] Manual: set a team in slot R32-M1; confirm the team name animates in.
- [ ] Manual: test at 320px; confirm horizontal scroll.

**Dependencies:** Tasks 1, 2, 3, 6

**Files touched:**
- `src/components/bracket/BracketConnector.tsx`
- `src/components/bracket/BracketMatch.tsx`
- `src/components/bracket/BracketRound.tsx`
- `src/components/bracket/KnockoutBracket.tsx`

**Estimated scope:** L → This is the highest-complexity UI task. Size is justified; cannot be split further without losing coherence.

---

#### Task 15: Knockout prediction page and bracket viewer page

**Description:**
Wire the `KnockoutBracket` into two pages. `/predict/knockout` uses editable bracket with R32 slots pre-populated from predicted group standings. `/bracket` is a read-only view. Both read from the `predictions.store`. The predict/knockout page also handles the gate: if group stage is incomplete, redirect to `/predict`.

**Acceptance criteria:**
- [ ] `/predict/knockout` pre-fills R32 slots from `tournament.store.groupStandings` (top 2 per group + 8 best 3rd).
- [ ] Clicking an editable slot opens a shadcn `Dialog` with candidate team options to select.
- [ ] Selecting a team writes to `knockoutPredictions` in the store.
- [ ] Teams propagate correctly: winning R32-M1 fills one slot in R16-M1.
- [ ] If `isGroupStageComplete === false`, page renders a lock state and a CTA back to `/predict/groups`.
- [ ] `/bracket` renders `KnockoutBracket` with `isEditable={false}`; no Dialog on click.
- [ ] `/bracket` has a "Print" button; CSS `@media print` hides nav/header.

**Verification:**
- [ ] Manual: complete all 48 group predictions → navigate to `/predict/knockout` → confirm R32 slots auto-filled.
- [ ] Manual: navigate to `/bracket` → bracket renders without any interactive controls.
- [ ] Manual: with 0 predictions → `/predict/knockout` → confirm locked state renders.

**Dependencies:** Tasks 4, 6, 13, 14

**Files touched:**
- `app/predict/knockout/page.tsx`
- `app/bracket/page.tsx`

**Estimated scope:** M

---

### Checkpoint 5: Full Prediction Flow

- [ ] End-to-end: group predictions → standings auto-fill → knockout predictions → bracket visible at `/bracket`.
- [ ] Predictions survive hard refresh at every step.
- [ ] Knockout lock gate works in both directions (lock, unlock).
- [ ] `npm run build` succeeds.

---

### Phase 7: Supporting Pages

---

#### Task 16: Schedule page

**Description:**
Build the `/schedule` page: all matches grouped by date using `MatchDaySection`. Matches show predicted score overlay if a prediction exists for that match. A venue filter (by country: USA / Canada / Mexico) narrows the schedule.

**Acceptance criteria:**
- [ ] All 48 group stage matches displayed, grouped by date in chronological order.
- [ ] Each `MatchCard` shows a prediction badge ("2–1") if the match has a prediction in the store; otherwise shows dash.
- [ ] Venue country filter (USA / Canada / Mexico / All) works correctly.
- [ ] Sticky date headers on scroll (using CSS `position: sticky`).
- [ ] Page renders fully at 320px.

**Verification:**
- [ ] Manual: open `/schedule`; confirm matches are in date order; enter a group prediction; return to schedule; confirm score badge appears.
- [ ] Build: `npm run build`

**Dependencies:** Tasks 2, 3, 5, 6, 10

**Files touched:**
- `app/schedule/page.tsx`

**Estimated scope:** S

---

#### Task 17: Leaderboard page and components

**Description:**
Build `LeaderboardRow`, `LeaderboardTable`, and the `/leaderboard` page. The user's row (computed via `scoring.ts` from their predictions vs `results.json`) is inserted into the seeded list at the correct position and highlighted. Top 3 rows get gold/silver/bronze visual treatment. Rows stagger-animate in on mount.

**Acceptance criteria:**
- [ ] `LeaderboardTable` renders 20 seeded entries + user row (21 total, or 20 if user is in top 20 by score).
- [ ] User row is visually distinct (gold border, highlighted background).
- [ ] Top 3 rows have gold/silver/bronze rank badges (icon + color + text, not only color).
- [ ] User's score is computed live from `scoring.ts(predictions, results)`.
- [ ] Row stagger animation: each row enters with `initial={{ opacity: 0, y: 8 }}` with 50ms delay per row.
- [ ] Page auto-scrolls to user row on mount.
- [ ] Renders correctly at 320px (columns collapse; rank, name, total points only on mobile).

**Verification:**
- [ ] Manual: enter predictions → open `/leaderboard` → confirm user row shows calculated points.
- [ ] Manual: with 0 predictions, user row shows 0 points; correct rank position.
- [ ] Build: `npm run build`

**Dependencies:** Tasks 2, 3, 4, 5, 6

**Files touched:**
- `src/components/leaderboard/LeaderboardRow.tsx`
- `src/components/leaderboard/LeaderboardTable.tsx`
- `app/leaderboard/page.tsx`

**Estimated scope:** M

---

### Phase 8: Dashboard and Onboarding

---

#### Task 18: Dashboard page and onboarding modal

**Description:**
Build the `/` dashboard and the first-visit onboarding `Dialog`. The dashboard is the hub: tournament countdown, user's prediction summary, quick-access CTAs to all sections. The onboarding dialog fires on first visit (`hasOnboarded === false`), captures the user's display name, and sets `hasOnboarded = true`.

**Acceptance criteria:**
- [ ] Dashboard shows: tournament name + host cities, days-until-kickoff countdown (to June 11 2026), user's prediction progress card, 4 quick-access cards (Groups, Schedule, Bracket, Leaderboard).
- [ ] Onboarding `Dialog` fires on first visit only (controlled by `user.store.hasOnboarded`).
- [ ] Dialog has a name input with placeholder "Enter your name", a "Start Predicting" button.
- [ ] Dialog traps focus; Escape closes it; `hasOnboarded` is set on close regardless of whether name was entered.
- [ ] Countdown shows days, hours, minutes — static (not live-updating, computed once on render from tournament start date).
- [ ] `PredictionSummary` component on the dashboard shows a compact grid of predicted results (or "No predictions yet" empty state).
- [ ] Dashboard is fully responsive at 320px.

**Verification:**
- [ ] Manual: clear localStorage → open `/` → onboarding dialog appears → enter name → dialog closes → name appears in header.
- [ ] Manual: hard refresh → onboarding dialog does NOT appear again.
- [ ] Build: `npm run build`

**Dependencies:** Tasks 1, 2, 5, 6, 12

**Files touched:**
- `app/page.tsx`
- `src/components/predictions/PredictionSummary.tsx`

**Estimated scope:** M

---

### Checkpoint 6: All Pages Complete

- [ ] All 10 routes render without errors.
- [ ] `npm run build` succeeds with zero errors.
- [ ] `npx tsc --noEmit` passes.
- [ ] No console errors at 320px, 768px, 1024px, 1440px.
- [ ] All mock data displays correctly throughout the app.

**Review with human before Phase 9.**

---

### Phase 9: Polish

---

#### Task 19: Framer Motion animations

**Description:**
Add the 4 spec-specified animations to already-built components. Each animation is additive — do not modify existing component logic, only wrap or add `motion.*` props.

**Acceptance criteria:**
- [ ] `GroupStandingsTable` rows reorder with `layout` prop + `layoutId` per team row (smooth reorder when predictions change score and standing).
- [ ] `KnockoutBracket` team name transitions use `AnimatePresence` + `motion.span` with `initial={{ opacity: 0, x: -4 }}`, `exit={{ opacity: 0, x: 4 }}`, 200ms.
- [ ] `LeaderboardRow` stagger entrance is connected (may already be done in Task 17 — verify here).
- [ ] Page entry fade (`initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, 250ms) on every page via a shared `PageWrapper` client component.
- [ ] No animation runs on `prefers-reduced-motion: reduce` — checked via CSS media query on motion values.

**Verification:**
- [ ] Manual: enter a score that changes standing order; confirm rows animate smoothly.
- [ ] Manual: set OS "Reduce Motion" setting; confirm animations are suppressed.
- [ ] Build: `npm run build`

**Dependencies:** Tasks 10, 14, 17, 18

**Files touched:**
- `src/components/groups/GroupStandingsTable.tsx`
- `src/components/bracket/KnockoutBracket.tsx`
- `src/components/leaderboard/LeaderboardRow.tsx`
- `src/components/layout/PageWrapper.tsx` (new, wraps pages)

**Estimated scope:** M

---

#### Task 20: Responsive audit and mobile polish

**Description:**
Systematic check at all 5 breakpoints for every page. Fix any layout breakages found. Focus on the two highest-risk areas: horizontal scroll on the bracket at mobile and the 12-tab group predictions form at narrow widths.

**Acceptance criteria:**
- [ ] Every page renders without horizontal overflow at 320px (except `KnockoutBracket` — intentional horizontal scroll).
- [ ] `KnockoutBracket` has `overflow-x-auto` and scroll indicators (gradient fade or scrollbar styling).
- [ ] `/predict/groups` tabs are horizontally scrollable at 320px with no text truncation.
- [ ] All touch targets are minimum 44×44px (WCAG 2.5.5 target size).
- [ ] `SiteHeader` logo + hamburger visible at 320px without overflow.

**Verification:**
- [ ] Manual: Chrome DevTools device emulation at 320px on every route.
- [ ] Manual: iPhone SE emulation for all interactive flows.

**Dependencies:** Tasks 5–18

**Files touched:**
- Multiple component files (responsive class additions only — no logic changes).

**Estimated scope:** M

---

#### Task 21: Accessibility audit and ARIA

**Description:**
Systematic pass through all interactive components to verify the spec's accessibility requirements. Focus on the 6 spec-listed requirements. Fix any gaps found.

**Acceptance criteria:**
- [ ] Tab through every page — focus order is logical, no focus traps outside the onboarding Dialog.
- [ ] `ScoreInput` `aria-label` follows the spec format exactly.
- [ ] `BracketMatch` slots have `role="group"` + `aria-label`.
- [ ] All flag emojis have `role="img"` + `aria-label`.
- [ ] Advancement status uses color + icon + text (never color alone).
- [ ] Onboarding Dialog: focus moves to name input on open; Escape closes and returns focus to trigger.
- [ ] No color-only state indicators anywhere (run a mental audit of all badge/status components).
- [ ] Lighthouse accessibility score ≥ 90 on `/` and `/predict/groups`.

**Verification:**
- [ ] Manual: tab through `/predict/groups` from top to bottom; no skipped elements.
- [ ] Manual: run Lighthouse accessibility audit on `/` and `/predict/groups`.
- [ ] Build: `npm run build`
- [ ] Type check: `npx tsc --noEmit`

**Dependencies:** Tasks 5–20

**Files touched:**
- `src/components/predictions/ScoreInput.tsx`
- `src/components/bracket/BracketMatch.tsx`
- `src/components/teams/TeamFlag.tsx`
- `src/components/groups/GroupStandingsTable.tsx`

**Estimated scope:** M

---

### Final Checkpoint

- [ ] All 17 success criteria from `docs/SPEC.md` are met.
- [ ] `npm run build` succeeds with zero errors.
- [ ] `npx tsc --noEmit` passes with zero errors.
- [ ] Lighthouse accessibility ≥ 90 on `/` and `/predict/groups`.
- [ ] No console errors at any breakpoint on any route.
- [ ] Predictions persist across hard refresh.
- [ ] Full end-to-end flow verified: onboarding → group predictions → knockout predictions → bracket → leaderboard.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| shadcn/ui CSS variable conflicts with Tailwind v4 | HIGH — breaks entire design system | Validate in Task 1 before proceeding. If CSS layers conflict, manually copy and re-implement only the needed shadcn components without their default CSS vars. |
| Zustand `persist` SSR hydration mismatch | HIGH — React errors on every page | `useHydrated()` hook established in Task 6 and enforced as a convention. All persisted state reads are gated behind this hook. |
| `KnockoutBracket` layout complexity (R32 = 16 matches) | MEDIUM — visual misalignment | `bracketSlot` field in data drives positions, not computed layout math. SVG connectors are per-pair, not per-round. |
| Mock data accuracy (real 2026 draw) | MEDIUM — wrong group assignments frustrate users | Use the official 2026 FIFA draw results for `data/groups.json`. Verify against FIFA.com before Task 3 is considered done. |
| `generateStaticParams` for 48+12 dynamic pages | LOW — purely mechanical | Pages share the same pattern; any issue shows up in first `npm run build`. |

---

## Parallelization Opportunities

If multiple implementation sessions are available:

| Parallel Track A | Parallel Track B | Prerequisite |
|---|---|---|
| Tasks 7–8 (Teams) | Tasks 9–10 (Groups) | Checkpoint 2 complete |
| Task 11 (Score inputs) | Task 16 (Schedule) | Checkpoint 3 complete |
| Task 17 (Leaderboard) | Task 18 (Dashboard) | Checkpoint 5 complete |
| Task 19 (Animations) | Task 20 (Responsive) | Checkpoint 6 complete |

Task 21 (Accessibility) must be last — it validates all prior work.

---

## Summary

| Phase | Tasks | Pages Delivered |
|---|---|---|
| 1: Foundation | 1–4 | — |
| 2: App Shell | 5–6 | Navigation shell |
| 3: Teams | 7–8 | `/teams`, `/teams/[teamId]` |
| 4: Groups | 9–10 | `/groups`, `/groups/[groupId]` |
| 5: Predictions Core | 11–13 | `/predict`, `/predict/groups` |
| 6: Knockout | 14–15 | `/predict/knockout`, `/bracket` |
| 7: Supporting Pages | 16–17 | `/schedule`, `/leaderboard` |
| 8: Dashboard | 18 | `/` |
| 9: Polish | 19–21 | All routes polished |
