"use client"

import type { FixturesBundle } from "@/src/data/loaders"
import {
  GROUP_MATCH_COUNT,
  countCompletedGroupPredictions,
} from "@/src/lib/tournament"
import { usePredictionsOptimistic } from "@/src/components/providers/PredictionsOptimisticProvider"
import { useHydrated } from "@/src/stores/hydration"
import { PredictionMatchCard } from "@/src/components/matches/PredictionMatchCard"
import { MatchCardSkeleton } from "@/src/components/matches/MatchCardSkeleton"
import { Progress } from "@/src/components/ui/progress"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"

interface FixturesPageContentProps {
  bundle: FixturesBundle
}

export function FixturesPageContent({ bundle }: FixturesPageContentProps) {
  const hydrated = useHydrated()
  const { matchPredictions } = usePredictionsOptimistic()
  const { groups, teamsById, venuesById, matchesByGroup } = bundle

  const completed = hydrated
    ? countCompletedGroupPredictions(matchPredictions)
    : null
  const progressPct =
    completed !== null
      ? Math.min(100, (completed / GROUP_MATCH_COUNT) * 100)
      : 0

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fixtures</h1>
          <p className="mt-1 text-sm text-text-muted">
            Predict scores for all 72 group-stage matches. Standings and the
            knockout bracket update automatically.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Progress</span>
            <span className="font-medium tabular-nums">
              {completed === null
                ? `— / ${GROUP_MATCH_COUNT}`
                : `${completed} / ${GROUP_MATCH_COUNT}`}
            </span>
          </div>
          <Progress
            value={progressPct}
            aria-label="Fixture prediction progress"
            className="mt-2 h-2 bg-surface-2"
          />
        </div>
      </header>

      <Tabs defaultValue="A" className="w-full">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className="inline-flex h-auto w-max min-w-full justify-start bg-surface-2 p-1">
            {groups.map((group) => (
              <TabsTrigger
                key={group.id}
                value={group.id}
                className="shrink-0 min-h-11 px-3 data-[state=active]:bg-surface data-[state=active]:text-gold"
              >
                Group {group.id}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {groups.map((group) => (
          <TabsContent
            key={group.id}
            value={group.id}
            className="mt-4 space-y-4"
          >
            <p className="text-sm text-text-muted">
              {group.name} — 6 matches
            </p>
            <div className="flex flex-col gap-3">
              {!hydrated
                ? Array.from({ length: 6 }).map((_, i) => (
                    <MatchCardSkeleton key={i} />
                  ))
                : matchesByGroup[group.id]?.map((match) => {
                    const homeTeam =
                      match.homeTeamId != null
                        ? teamsById[match.homeTeamId]
                        : undefined
                    const awayTeam =
                      match.awayTeamId != null
                        ? teamsById[match.awayTeamId]
                        : undefined
                    const venue = venuesById[match.venueId]

                    if (!homeTeam || !awayTeam || !venue) return null

                    return (
                      <PredictionMatchCard
                        key={match.id}
                        match={match}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                        venue={venue}
                      />
                    )
                  })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
