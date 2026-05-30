"use client"

import { GuardedLink } from "@/src/components/layout/GuardedLink"
import {
  CalendarDays,
  LayoutGrid,
  Trophy,
  Medal,
  Users,
} from "lucide-react"
import { Progress } from "@/src/components/ui/progress"
import { usePredictionsOptimistic } from "@/src/components/providers/PredictionsOptimisticProvider"
import { useTournamentDerived } from "@/src/stores/tournament.selectors"
import { useHydrated } from "@/src/stores/hydration"
import {
  GROUP_MATCH_COUNT,
  countCompletedGroupPredictions,
} from "@/src/lib/tournament"
import { cn } from "@/src/lib/utils"

const KICKOFF = new Date("2026-06-11T18:00:00-05:00")

function getCountdown() {
  const diffMs = Math.max(0, KICKOFF.getTime() - Date.now())
  const days = Math.floor(diffMs / 86_400_000)
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000)
  return { days, hours }
}

function HeroSection() {
  const { days, hours } = getCountdown()

  return (
    <section
      aria-labelledby="hero-title"
      className="rounded-lg border border-border bg-surface p-6 sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-gold">
            FIFA World Cup
          </p>
          <h1
            id="hero-title"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            FIFA World Cup 2026
          </h1>
          <p className="text-sm text-text-muted">
            Toronto · New York · Mexico City
          </p>
        </div>

        <div
          className="flex flex-wrap gap-4 sm:gap-6"
          aria-label="Countdown to tournament kickoff"
        >
          <div className="min-w-18 rounded-md bg-surface-2 px-4 py-3 text-center">
            <p className="text-2xl font-bold tabular-nums text-gold sm:text-3xl">
              {days}
            </p>
            <p className="text-xs text-text-muted">Days</p>
          </div>
          <div className="min-w-18 rounded-md bg-surface-2 px-4 py-3 text-center">
            <p className="text-2xl font-bold tabular-nums text-gold sm:text-3xl">
              {hours}
            </p>
            <p className="text-xs text-text-muted">Hours</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function PredictionProgressCard() {
  const hydrated = useHydrated()
  const { matchPredictions } = usePredictionsOptimistic()
  const { r32Matchups, isGroupStageComplete: stageComplete } =
    useTournamentDerived()

  const completed = hydrated
    ? countCompletedGroupPredictions(matchPredictions)
    : null

  const progressPct =
    completed !== null
      ? Math.min(100, (completed / GROUP_MATCH_COUNT) * 100)
      : 0

  const r32Ready = stageComplete
    ? r32Matchups.filter((m) => m.homeTeamId && m.awayTeamId).length
    : 0

  return (
    <section
      aria-labelledby="progress-title"
      className="rounded-lg border border-border bg-surface p-6"
    >
      <h2 id="progress-title" className="mb-4 text-lg font-semibold">
        Your Predictions
      </h2>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Fixtures</span>
            <span className="font-medium tabular-nums">
              {completed === null
                ? `— / ${GROUP_MATCH_COUNT}`
                : `${completed} / ${GROUP_MATCH_COUNT}`}
            </span>
          </div>
          <Progress
            value={progressPct}
            aria-label="Fixture prediction progress"
            className="h-2 bg-surface-2"
          />
        </div>

        {hydrated && stageComplete && (
          <p className="text-xs text-text-muted">
            {r32Ready} / 16 Round of 32 matchups determined
          </p>
        )}

        <GuardedLink
          href="/fixtures"
          className="inline-flex min-h-11 items-center rounded-md bg-gold px-4 text-sm font-medium text-pitch transition-colors hover:bg-gold/90"
        >
          {completed === GROUP_MATCH_COUNT
            ? "Review fixtures"
            : "Predict fixtures"}
        </GuardedLink>
      </div>
    </section>
  )
}

const QUICK_LINKS = [
  {
    href: "/fixtures",
    label: "Fixtures",
    description: "Predict all 72 group-stage matches",
    icon: CalendarDays,
  },
  {
    href: "/groups",
    label: "Groups",
    description: "View derived group standings",
    icon: LayoutGrid,
  },
  {
    href: "/brackets",
    label: "Brackets",
    description: "Auto-generated knockout bracket",
    icon: Trophy,
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    description: "See how you rank against others",
    icon: Medal,
  },
  {
    href: "/community",
    label: "Community",
    description: "Browse picks and activity feed",
    icon: Users,
  },
] as const

function QuickAccessGrid() {
  return (
    <section aria-labelledby="quick-access-title">
      <h2 id="quick-access-title" className="mb-4 text-lg font-semibold">
        Quick Access
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
        {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
          <GuardedLink
            key={href}
            href={href}
            className={cn(
              "group flex min-h-11 flex-col gap-3 rounded-lg border border-border bg-surface p-4",
              "transition-colors hover:border-gold/40 hover:bg-surface-2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="mt-1 text-xs leading-snug text-text-muted">
                {description}
              </p>
            </div>
          </GuardedLink>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <div className="space-y-8">
        <HeroSection />
        <PredictionProgressCard />
        <QuickAccessGrid />
      </div>

    </>
  )
}
