# Spec: FIFA World Cup 2026 Predictor — Frontend UI

**Status:** Draft · **Date:** 2026-05-30 · **Author:** Frontend Team

---

## 1. Objective

Build a single-user FIFA World Cup 2026 prediction web app. The user predicts match scores across all tournament stages, sees a live bracket reflecting their predictions, and can compare their standing against a mock leaderboard of seeded users.

**User:** A football fan who wants to fill out a prediction bracket before and during the tournament.

**Success looks like:**
- User can predict every group stage match score.
- Predicted standings automatically derive group advancement.
- User can complete a knockout bracket based on their predicted group results.
- The full bracket is always visible and reflects predictions.
- The experience is fast, visually polished, and usable on mobile.

---

## 2. Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.2.6 (App Router) | Already in project |
| Language | TypeScript 5, strict mode | Already in project |
| Styling | Tailwind CSS 4 | Already in project, uses `@import "tailwindcss"` |
| Component library | shadcn/ui | Needs install |
| State management | Zustand 5 | Needs install |
| Animation | Framer Motion 12 | Needs install |
| Icons | Lucide React | Bundled with shadcn/ui |
| Mock data | Static JSON in `src/data/` | No API, no fetch |

**Rendering model:**
- Pages and layouts default to **Server Components** (Next.js 16 default).
- Any component using Zustand, `useState`, `useEffect`, event handlers, or Framer Motion requires `'use client'`.
- Zustand stores are client-only. They hydrate from `localStorage` on mount.

---

## 3. Commands

```
Install:     npm install
Dev server:  npm run dev          → http://localhost:3000
Build:       npm run build
Type check:  npx tsc --noEmit
Lint:        npm run lint
```

---

## 4. Project Structure

```
predict-arena/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Server Component)
│   ├── page.tsx                  # / → Dashboard
│   ├── globals.css               # Tailwind v4 entry + design tokens
│   ├── groups/
│   │   ├── page.tsx              # /groups → All groups overview
│   │   └── [groupId]/
│   │       └── page.tsx          # /groups/A → Single group detail
│   ├── predict/
│   │   ├── layout.tsx            # Predict sub-layout (progress indicator)
│   │   ├── page.tsx              # /predict → Prediction hub entry
│   │   ├── groups/
│   │   │   └── page.tsx          # /predict/groups → Group stage predictions
│   │   └── knockout/
│   │       └── page.tsx          # /predict/knockout → Bracket predictions
│   ├── bracket/
│   │   └── page.tsx              # /bracket → Full bracket viewer (read-only)
│   ├── schedule/
│   │   └── page.tsx              # /schedule → Full match schedule
│   ├── teams/
│   │   ├── page.tsx              # /teams → All 48 teams grid
│   │   └── [teamId]/
│   │       └── page.tsx          # /teams/usa → Team profile
│   └── leaderboard/
│       └── page.tsx              # /leaderboard → Mock rankings
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── SiteHeader.tsx    # Sticky nav, mobile menu
│   │   │   ├── SiteFooter.tsx    # Footer
│   │   │   └── MobileNav.tsx     # Sheet-based mobile navigation
│   │   ├── groups/
│   │   │   ├── GroupCard.tsx     # Group standings summary card
│   │   │   ├── GroupStandingsTable.tsx  # Full points table
│   │   │   └── GroupGrid.tsx     # 12-group grid layout
│   │   ├── matches/
│   │   │   ├── MatchCard.tsx     # Match display (teams, date, venue)
│   │   │   ├── MatchList.tsx     # Scrollable list of matches
│   │   │   └── MatchDaySection.tsx  # Grouped by date
│   │   ├── predictions/
│   │   │   ├── ScoreInput.tsx    # Numeric score input for one match
│   │   │   ├── PredictionCard.tsx   # MatchCard + ScoreInput combined
│   │   │   ├── PredictionProgress.tsx  # % complete progress bar
│   │   │   ├── GroupPredictionsForm.tsx  # All matches for one group
│   │   │   └── PredictionSummary.tsx    # Summary of all predictions
│   │   ├── bracket/
│   │   │   ├── KnockoutBracket.tsx  # Full bracket visualization
│   │   │   ├── BracketRound.tsx     # One round column
│   │   │   ├── BracketMatch.tsx     # Single match slot in bracket
│   │   │   └── BracketConnector.tsx # SVG connector lines
│   │   ├── teams/
│   │   │   ├── TeamCard.tsx      # Flag + name + group card
│   │   │   ├── TeamFlag.tsx      # Country flag display (emoji fallback)
│   │   │   └── TeamGrid.tsx      # Responsive grid of TeamCards
│   │   ├── leaderboard/
│   │   │   ├── LeaderboardTable.tsx   # Full rankings table
│   │   │   └── LeaderboardRow.tsx     # Single rank entry
│   │   └── ui/                   # shadcn/ui primitives (generated)
│   │       └── ...               # button, card, badge, sheet, etc.
│   │
│   ├── stores/
│   │   ├── predictions.store.ts  # User's match predictions
│   │   ├── user.store.ts         # User profile (name, avatar seed)
│   │   └── tournament.store.ts   # Derived tournament state (standings)
│   │
│   ├── data/                     # Static mock JSON (no fetch)
│   │   ├── teams.json            # 48 teams
│   │   ├── groups.json           # 12 groups with team IDs
│   │   ├── matches.json          # All scheduled matches
│   │   ├── schedule.json         # Match dates + venues
│   │   └── leaderboard.json      # 20 seeded mock users
│   │
│   ├── lib/
│   │   ├── tournament.ts         # Pure fns: derive standings, advance teams
│   │   ├── scoring.ts            # Prediction scoring rules
│   │   └── utils.ts              # cn(), formatDate(), formatScore()
│   │
│   └── types/
│       ├── tournament.ts         # Team, Group, Match, Standing types
│       ├── predictions.ts        # UserPrediction, PredictionState types
│       └── leaderboard.ts        # LeaderboardEntry type
│
├── public/
│   └── flags/                    # SVG/PNG flag assets (optional)
│
└── docs/
    └── SPEC.md                   # This file
```

---

## 5. Route Map

| Route | Page | Rendering | Description |
|---|---|---|---|
| `/` | Dashboard | Server | Tournament overview, countdown, user prediction progress |
| `/groups` | Groups overview | Server | 12-group grid with mini standings |
| `/groups/[groupId]` | Group detail | Server | Full standings + match list for one group |
| `/predict` | Prediction hub | Server | Entry card with progress bars per stage |
| `/predict/groups` | Group predictions | **Client** | Score inputs for all 48 group matches |
| `/predict/knockout` | Knockout bracket | **Client** | Interactive bracket, advances from group predictions |
| `/bracket` | Bracket viewer | **Client** | Read-only bracket reflecting user's predictions |
| `/schedule` | Schedule | Server | All matches by date with predicted scores overlay |
| `/teams` | Teams grid | Server | All 48 teams, filterable by group/confederation |
| `/teams/[teamId]` | Team profile | Server | Flag, group, players (mock), predicted results |
| `/leaderboard` | Leaderboard | Server | Mock rankings, user's position highlighted |

**Route constraints:**
- `/predict/knockout` is disabled (shows locked state) until the user has predicted all group stage matches.
- Dynamic segments `[groupId]` and `[teamId]` use `generateStaticParams` (no ISR needed since data is static JSON).

---

## 6. Mock Data Shape

### `data/teams.json`

```
Team {
  id: string              // "usa", "brazil", "france"
  name: string            // "United States"
  shortName: string       // "USA"
  confederation: string   // "CONCACAF" | "UEFA" | "CONMEBOL" | "CAF" | "AFC" | "OFC"
  flagEmoji: string       // "🇺🇸"
  flagCode: string        // "us" (ISO 3166-1 alpha-2 for flag CDN)
  fifaRanking: number
  groupId: string         // "A"
}
```

### `data/groups.json`

```
Group {
  id: string              // "A" through "L"
  name: string            // "Group A"
  teamIds: string[]       // exactly 4 team IDs
}
```

### `data/matches.json`

```
Match {
  id: string              // "m001"
  stage: "group" | "r32" | "r16" | "qf" | "sf" | "3rd" | "final"
  groupId: string | null  // null for knockout
  homeTeamId: string | null   // null for unresolved knockout slots
  awayTeamId: string | null
  date: string            // ISO 8601 "2026-06-11T18:00:00-05:00"
  venueId: string
  bracketSlot: string | null  // "r32-m1" for bracket positioning
}
```

### `data/schedule.json`

```
Venue {
  id: string
  name: string            // "MetLife Stadium"
  city: string            // "East Rutherford"
  country: string         // "USA" | "Canada" | "Mexico"
  capacity: number
  timezone: string        // "America/New_York"
}
```

### `data/leaderboard.json`

```
LeaderboardEntry {
  id: string
  displayName: string
  avatarSeed: string      // used with DiceBear for deterministic avatars
  totalPoints: number
  correctScores: number   // exact score prediction
  correctResults: number  // correct outcome (W/D/L)
  groupStagePoints: number
  knockoutPoints: number
  rank: number
}
```

---

## 7. Zustand Stores

### `predictions.store.ts`

```
State:
  matchPredictions: Record<matchId, { homeScore: number; awayScore: number } | null>
  knockoutPredictions: Record<bracketSlot, teamId | null>

Actions:
  setPrediction(matchId, homeScore, awayScore): void
  clearPrediction(matchId): void
  setKnockoutAdvance(bracketSlot, teamId): void
  resetAll(): void

Derived (computed inline):
  completedGroupMatches: number   // count of non-null predictions for group matches
  totalGroupMatches: number       // 48
  isGroupStageComplete: boolean
  completedKnockoutSlots: number
  totalKnockoutSlots: number

Persistence: localStorage key "pa:predictions" via Zustand persist middleware
```

### `user.store.ts`

```
State:
  displayName: string         // default "Predictor"
  avatarSeed: string          // random UUID on first visit
  hasOnboarded: boolean

Actions:
  setDisplayName(name): void
  setAvatarSeed(seed): void
  completeOnboarding(): void

Persistence: localStorage key "pa:user"
```

### `tournament.store.ts`

```
State (derived, not persisted):
  groupStandings: Record<groupId, Standing[]>

Standing {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  advancementStatus: "advances" | "maybe" | "eliminated" | "tbd"
}

Actions:
  recomputeStandings(matchPredictions): void

Note: This store is derived entirely from predictions.store.
      It recomputes whenever predictions change.
      Pure computation lives in src/lib/tournament.ts.
```

---

## 8. Component Inventory

### Layout Components

| Component | Rendering | Props | Behavior |
|---|---|---|---|
| `SiteHeader` | Client | — | Sticky. Mobile hamburger → `MobileNav` sheet. Active link highlight. Prediction progress indicator in nav. |
| `MobileNav` | Client | `isOpen, onClose` | shadcn `Sheet` from left. Full route list. Closes on navigate. |
| `SiteFooter` | Server | — | Static. Tournament credits, GitHub link. |

### Group Components

| Component | Rendering | Props | Behavior |
|---|---|---|---|
| `GroupCard` | Server | `group, teams, standings` | Shows group letter, 4 teams with mini points. Links to group detail. |
| `GroupGrid` | Server | `groups[]` | 12-card responsive grid. `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` |
| `GroupStandingsTable` | Client | `standings, teams` | Full points table. Highlights advancement positions. Animated row reordering via Framer Motion `layout` prop. |

### Match Components

| Component | Rendering | Props | Behavior |
|---|---|---|---|
| `MatchCard` | Server | `match, homeTeam, awayTeam, prediction?` | Shows flags, team names, date/venue, optional score overlay. |
| `MatchDaySection` | Server | `date, matches[]` | Groups matches under a formatted date heading. |
| `MatchList` | Server | `matches[], ...` | Wraps `MatchDaySection` groups. |

### Prediction Components

| Component | Rendering | Props | Behavior |
|---|---|---|---|
| `ScoreInput` | **Client** | `matchId, value, onChange` | Two number inputs (0–99). Increment/decrement buttons. Accessible with `aria-label`. |
| `PredictionCard` | **Client** | `match, homeTeam, awayTeam` | `MatchCard` + `ScoreInput` inline. Reads/writes predictions store. |
| `GroupPredictionsForm` | **Client** | `groupId` | All 6 matches for one group. Scrollable. Group standings update live as scores change. |
| `PredictionProgress` | **Client** | — | Reads store. Two progress bars: group stage, knockout. |
| `PredictionSummary` | **Client** | — | Card grid of all predicted results. Print-friendly. |

### Bracket Components

| Component | Rendering | Props | Behavior |
|---|---|---|---|
| `KnockoutBracket` | **Client** | `matches[], predictions` | Full bracket tree. Horizontal scroll on mobile. Framer Motion `AnimatePresence` for team name transitions. |
| `BracketRound` | **Client** | `round, matches[]` | Single round column (R32, R16, QF, SF, Final). |
| `BracketMatch` | **Client** | `match, isEditable` | Match slot. Editable in `/predict/knockout`, read-only in `/bracket`. |
| `BracketConnector` | Server | `top, bottom` | SVG lines connecting match slots. |

### Team Components

| Component | Rendering | Props | Behavior |
|---|---|---|---|
| `TeamCard` | Server | `team` | Flag emoji, name, confederation badge, FIFA ranking. Links to team profile. |
| `TeamFlag` | Server | `team, size` | Renders flag emoji at scale. `aria-label={team.name}`. |
| `TeamGrid` | Server | `teams[]` | `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6` |

### Leaderboard Components

| Component | Rendering | Props | Behavior |
|---|---|---|---|
| `LeaderboardTable` | **Client** | `entries, currentUserId` | Table with rank, avatar, name, points breakdown. Current user row highlighted. Top 3 have gold/silver/bronze accents. |
| `LeaderboardRow` | **Client** | `entry, isCurrentUser` | Single row. Framer Motion entrance animation. |

---

## 9. Design System

### Color Tokens (defined in `globals.css`)

```
--color-pitch:      #0a1628   (deep navy — primary background)
--color-surface:    #111d33   (card backgrounds)
--color-surface-2:  #1a2d4a   (elevated surfaces)
--color-border:     #1e3352   (borders)
--color-text:       #f0f4f8   (primary text)
--color-text-muted: #6b8aaa   (secondary text)
--color-accent:     #e4b524   (gold — highlights, winners, CTAs)
--color-success:    #22c55e
--color-danger:     #ef4444
--color-info:       #3b82f6
```

Rationale: Deep navy + gold evokes a trophy/night-match aesthetic aligned with World Cup 2026 brand. No purple gradients. No generic "SaaS blue."

### Typography Scale

```
font-display: "Geist", sans-serif   (headings — already in Next.js default)
font-body:    "Geist", sans-serif

heading-xl:  2.25rem / 700 / tight   (page titles)
heading-lg:  1.5rem  / 600 / tight   (section titles)
heading-md:  1.125rem / 600 / normal (card titles)
body:        1rem / 400 / relaxed    (default)
body-sm:     0.875rem / 400 / normal (secondary)
label:       0.75rem / 500 / wide    (badges, labels)
```

### Spacing Scale

Tailwind default 4px base. Use only scale values: `1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24`.

### Border Radius

```
sm:   4px    (inputs, badges)
md:   8px    (cards — default)
lg:   12px   (panels, modals)
full: 9999px (pills, avatars)
```

### Motion Principles (Framer Motion)

```
Duration:    150ms (micro), 250ms (standard), 400ms (page enter)
Easing:      ease-out for entrances, ease-in for exits
Principles:
  - Bracket team name transitions: fade + slide (200ms)
  - Standings reorder: layout animation (300ms)
  - Leaderboard row entrance: staggered fade-in (50ms delay per row)
  - Page transitions: fade only (250ms) — no slide, too slow on mobile
  - Score input changes: no animation (immediate feedback required)
```

---

## 10. User Flows

### Flow 1: First Visit

```
/ → Onboarding modal (enter display name) → dismiss → Dashboard
```

- Name saved to `user.store`.
- Prediction progress shows 0/48 group predictions.
- CTA: "Start Predicting" → `/predict/groups`

### Flow 2: Group Stage Prediction

```
/predict/groups → GroupTab(A-L) → PredictionCard × 6 → auto-save
```

- Predictions store updates on each `ScoreInput` blur.
- Group standings sidebar updates live (derived from store).
- Progress bar in header updates.
- When all 48 matches predicted → knockout tab unlocks.

### Flow 3: Knockout Bracket Prediction

```
/predict/knockout → BracketMatch (pre-filled from group results) → edit → save
```

- R32 slots pre-populate from predicted group standings.
- User can override TBD slots by selecting from candidate teams.
- Advancing teams propagate forward automatically.
- Final prediction sets "Predicted Champion."

### Flow 4: Bracket Review

```
/bracket → KnockoutBracket (read-only) → hover match for score detail
```

- Full visual bracket. Print button (CSS `@media print`).

### Flow 5: Leaderboard Check

```
/leaderboard → LeaderboardTable → user row auto-scrolled into view
```

- User's mock score is computed by `src/lib/scoring.ts` against seeded "real results" in the mock data.
- No real backend. Score is deterministic.

### Flow 6: Team Deep-Dive

```
/teams → filter by group or confederation → /teams/[teamId]
```

- Team page shows: flag, FIFA ranking, group assignment, all group matches (with user's predicted scores), predicted advancement status.

---

## 11. Responsiveness Requirements

| Breakpoint | Key Layout Changes |
|---|---|
| 320px (xs) | Single column everything. Bracket horizontal scroll. Score inputs full-width. |
| 640px (sm) | Group grid → 2 cols. Teams → 3 cols. |
| 768px (md) | `/predict/groups` → side-by-side standings + matches. |
| 1024px (lg) | Group grid → 3 cols. Bracket full-width (no horizontal scroll). |
| 1440px (xl) | Group grid → 4 cols. Max content width: 1280px centered. |

---

## 12. Accessibility Requirements (WCAG 2.1 AA)

- All interactive elements keyboard-accessible. Tab order is logical.
- `ScoreInput` has `aria-label="Home score for {homeTeam.name} vs {awayTeam.name}"`.
- `BracketMatch` slots use `role="group"` with `aria-label` of the matchup.
- Flag emojis wrapped in `<span role="img" aria-label="{team.name} flag">`.
- Color alone never conveys state — advancement uses both color + icon + text.
- Focus ring visible on all interactive elements (Tailwind `focus-visible:ring-2`).
- Modal (onboarding) traps focus and returns it on close.

---

## 13. Loading / Error / Empty States

Every data-dependent component needs all three:

| Component | Loading | Empty | Error |
|---|---|---|---|
| `GroupGrid` | 12 skeleton cards | — | "Could not load groups" |
| `KnockoutBracket` | Skeleton bracket shape | "Complete group predictions to unlock" | — |
| `LeaderboardTable` | Row skeletons | — | "Leaderboard unavailable" |
| `TeamGrid` | Card skeletons | "No teams match your filter" | — |
| `PredictionCard` | — | — | Score resets to 0 on parse error |

---

## 14. Scoring Rules (for Mock Leaderboard)

Documented here so UI can display breakdowns accurately:

```
Correct exact score:     3 points
Correct result only:     1 point (W/D/L)
Correct group qualifier: 2 points (right team advancing)
Correct knockout winner: 5 points (per round, multiplied by round)
```

`src/lib/scoring.ts` computes user score against `data/results.json` (mock "final results").

---

## 15. Dependencies to Install

```
npm install zustand framer-motion
npx shadcn@latest init
npx shadcn@latest add button card badge sheet progress tabs
npx shadcn@latest add table input separator tooltip dialog
```

**shadcn/ui note:** Init will ask for Tailwind CSS — choose the v4 config path since this project already uses Tailwind v4.

---

## 16. Boundaries

**Always:**
- `'use client'` on any component using Zustand, `useState`, `useEffect`, or Framer Motion.
- All data reads from static JSON imports — no `fetch()`.
- TypeScript strict mode. No `any`. No `as` casts without a comment justifying it.
- Spacing values from the Tailwind scale only. No arbitrary pixel values.
- Every interactive element keyboard-accessible.

**Ask first:**
- Adding a new npm dependency.
- Adding a new route not in the route map above.
- Changing mock data shape (downstream type impact).
- Changing the scoring algorithm.

**Never:**
- `fetch()` or API calls of any kind (no backend exists).
- Designing database schemas or API contracts.
- Inline styles or arbitrary Tailwind values (e.g. `w-[347px]` without strong justification).
- Committing `node_modules` or build artifacts.
- Skipping loading/error/empty states.

---

## 17. Success Criteria

- [ ] User can predict scores for all 48 group stage matches.
- [ ] Group standings update live as scores are entered.
- [ ] Knockout bracket unlocks only after all group matches are predicted.
- [ ] R32 bracket pre-populates from predicted group standings.
- [ ] Bracket is viewable read-only at `/bracket`.
- [ ] Leaderboard shows 20 mock users with user's position visible.
- [ ] All 48 teams viewable with group context.
- [ ] Full schedule browsable by date.
- [ ] Predictions persist across page refreshes (localStorage).
- [ ] App is fully functional at 320px viewport.
- [ ] Lighthouse accessibility score ≥ 90.
- [ ] No TypeScript errors (`npx tsc --noEmit` passes).
- [ ] No console errors in dev or production build.

---

## 18. Open Questions

None currently. Assumptions in Section 0 should be confirmed before implementation begins.
