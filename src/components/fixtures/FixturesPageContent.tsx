"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import type { FixturesBundle } from "@/src/data/loaders"
import {
  GROUP_MATCH_COUNT,
  countCompletedGroupPredictions,
  isGroupComplete,
  isGroupStageComplete,
} from "@/src/lib/tournament"
import { usePredictionsOptimistic } from "@/src/components/providers/PredictionsOptimisticProvider"
import { useHydrated } from "@/src/stores/hydration"
import { PredictionMatchCard } from "@/src/components/matches/PredictionMatchCard"
import { MatchCardSkeleton } from "@/src/components/matches/MatchCardSkeleton"
import { Progress } from "@/src/components/ui/progress"
import { Button } from "@/src/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"
import { CheckCircle2, ArrowRight } from "lucide-react"

interface FixturesPageContentProps {
  bundle: FixturesBundle
}

export function FixturesPageContent({ bundle }: FixturesPageContentProps) {
  const hydrated = useHydrated()
  const { matchPredictions } = usePredictionsOptimistic()
  const { groups, teamsById, venuesById, matchesByGroup } = bundle

  const groupIds = useMemo(() => groups.map((g) => g.id), [groups])

  const [activeGroup, setActiveGroup] = useState(groupIds[0] ?? "A")
  // Track active group in a ref so the prediction-watching effect
  // can read the current value without being listed as a dependency.
  const activeGroupRef = useRef(activeGroup)
  useEffect(() => {
    activeGroupRef.current = activeGroup
  }, [activeGroup])

  // Snapshot of per-group completion at the time of the previous render.
  const prevCompleteRef = useRef<Record<string, boolean>>({})

  // Auto-advance: when the active group's last prediction is set, jump to next.
  useEffect(() => {
    if (!hydrated) return

    const currentGroupId = activeGroupRef.current
    const wasComplete = prevCompleteRef.current[currentGroupId] ?? false
    const nowComplete = isGroupComplete(currentGroupId, matchPredictions)

    // Update snapshot for all groups (cheap — just 12 boolean checks).
    const next: Record<string, boolean> = {}
    for (const id of groupIds) {
      next[id] = isGroupComplete(id, matchPredictions)
    }
    prevCompleteRef.current = next

    if (!wasComplete && nowComplete) {
      const idx = groupIds.indexOf(currentGroupId)
      const nextGroupId = groupIds[idx + 1]
      if (nextGroupId) {
        setActiveGroup(nextGroupId)
        // Scroll the newly active tab into view.
        requestAnimationFrame(() => {
          document
            .querySelector(`[data-radix-collection-item][data-state="active"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
        })
      }
      // If no nextGroupId, it was the last group — isGroupStageComplete handles the CTA.
    }
  }, [matchPredictions, hydrated, groupIds])

  const completed = hydrated
    ? countCompletedGroupPredictions(matchPredictions)
    : null
  const progressPct =
    completed !== null
      ? Math.min(100, (completed / GROUP_MATCH_COUNT) * 100)
      : 0

  const allDone = hydrated && isGroupStageComplete(matchPredictions)

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

      {allDone && (
        <div
          role="status"
          className="flex flex-col items-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" aria-hidden="true" />
            <div>
              <p className="font-semibold text-emerald-300">All predictions complete!</p>
              <p className="mt-0.5 text-sm text-text-muted">
                Your group-stage bracket is locked in. Head to Brackets to pick the knockout winners.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 bg-gold text-surface hover:bg-gold/90">
            <Link href="/brackets">
              Proceed to Brackets
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      )}

      <Tabs value={activeGroup} onValueChange={setActiveGroup} className="w-full">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className="inline-flex h-auto w-max min-w-full justify-start bg-surface-2 p-1">
            {groups.map((group) => {
              const done = hydrated && isGroupComplete(group.id, matchPredictions)
              return (
                <TabsTrigger
                  key={group.id}
                  value={group.id}
                  className="relative shrink-0 min-h-11 px-3 data-[state=active]:bg-surface data-[state=active]:text-gold"
                >
                  Group {group.id}
                  {done && (
                    <span
                      className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500"
                      aria-label={`Group ${group.id} complete`}
                    />
                  )}
                </TabsTrigger>
              )
            })}
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
