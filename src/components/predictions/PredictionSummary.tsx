"use client"

import Link from "next/link"
import { groups, matches, teams } from "@/src/data"
import { buildTeamMap } from "@/src/lib/teams"
import { formatScore } from "@/src/lib/utils"
import type { MatchPrediction } from "@/src/types/predictions"
import { TeamFlag } from "@/src/components/teams/TeamFlag"
import { Button } from "@/src/components/ui/button"

const teamsById = buildTeamMap(teams)

const groupMatches = matches.filter((match) => match.stage === "group")

interface PredictionSummaryProps {
  matchPredictions: Record<string, MatchPrediction | null>
  hydrated: boolean
}

export function PredictionSummary({
  matchPredictions,
  hydrated,
}: PredictionSummaryProps) {
  const hasAnyPrediction = groupMatches.some(
    (match) => matchPredictions[match.id] != null,
  )

  if (!hydrated) {
    return (
      <div
        className="space-y-4 rounded-lg border border-border bg-surface p-4"
        aria-busy="true"
        aria-label="Loading predictions"
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse space-y-2">
            <div className="h-4 w-20 rounded bg-surface-2" />
            <div className="h-10 rounded bg-surface-2" />
            <div className="h-10 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    )
  }

  if (!hasAnyPrediction) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <p className="text-sm text-text-muted">
          You haven&apos;t made any predictions yet
        </p>
        <Button asChild className="mt-4">
          <Link href="/fixtures">Start Predicting</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        const matchesForGroup = groupMatches.filter(
          (match) => match.groupId === group.id,
        )

        return (
          <section key={group.id} aria-labelledby={`group-${group.id}-heading`}>
            <h3
              id={`group-${group.id}-heading`}
              className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold"
            >
              {group.name}
            </h3>
            <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
              {matchesForGroup.map((match) => {
                const homeTeam =
                  match.homeTeamId != null
                    ? teamsById[match.homeTeamId]
                    : undefined
                const awayTeam =
                  match.awayTeamId != null
                    ? teamsById[match.awayTeamId]
                    : undefined
                const prediction = matchPredictions[match.id] ?? null

                if (!homeTeam || !awayTeam) return null

                return (
                  <li
                    key={match.id}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-2 text-sm">
                      <TeamFlag
                        emoji={homeTeam.flagEmoji}
                        name={homeTeam.name}
                        size="sm"
                      />
                      <span className="truncate">{homeTeam.shortName}</span>
                      <span className="text-text-muted">vs</span>
                      <TeamFlag
                        emoji={awayTeam.flagEmoji}
                        name={awayTeam.name}
                        size="sm"
                      />
                      <span className="truncate">{awayTeam.shortName}</span>
                    </div>
                    <span
                      className={
                        prediction
                          ? "text-sm font-semibold text-gold"
                          : "text-sm text-text-muted"
                      }
                    >
                      {prediction
                        ? formatScore(prediction.homeScore, prediction.awayScore)
                        : "—"}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
