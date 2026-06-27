"use client"

import Link from "next/link"
import { matches, teams, venues } from "@/src/data"
import { buildTeamMap } from "@/src/lib/teams"
import { usePredictionsOptimistic } from "@/src/components/providers/PredictionsOptimisticProvider"
import { computeTournamentDerived } from "@/src/stores/tournament.selectors"
import { useHydrated } from "@/src/stores/hydration"
import { GroupStandingsTable } from "@/src/components/groups/GroupStandingsTable"
import { GroupStandingsTableSkeleton } from "@/src/components/groups/GroupStandingsTableSkeleton"
import { MatchCard } from "@/src/components/matches/MatchCard"
import { MatchCardSkeleton } from "@/src/components/matches/MatchCardSkeleton"
import { Button } from "@/src/components/ui/button"
import officialResults from "@/src/data/results.json"

const teamsById = buildTeamMap(teams)
const venuesById = Object.fromEntries(venues.map((venue) => [venue.id, venue]))
const resultsMap = officialResults as Record<string, { homeScore: number; awayScore: number }>

interface GroupDetailContentProps {
  groupId: string
  groupName: string
}

export function GroupDetailContent({
  groupId,
  groupName,
}: GroupDetailContentProps) {
  const hydrated = useHydrated()
  const { matchPredictions } = usePredictionsOptimistic()

  // Merge official results over user predictions so standings reflect real scores
  const mergedPredictions = { ...matchPredictions }
  for (const [matchId, result] of Object.entries(resultsMap)) {
    mergedPredictions[matchId] = { homeScore: result.homeScore, awayScore: result.awayScore }
  }

  const { groupStandings, groupComplete } = computeTournamentDerived(mergedPredictions)

  const standings = groupStandings[groupId] ?? []
  const standingsReady = groupComplete[groupId] ?? false
  const groupMatches = matches.filter(
    (match) => match.groupId === groupId && match.stage === "group",
  )

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-text-muted">
          <li>
            <Link href="/groups" className="transition-colors hover:text-gold">
              Groups
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-foreground" aria-current="page">
            {groupName}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{groupName}</h1>
          <p className="mt-1 text-sm text-text-muted">
            Read-only standings derived from your fixture predictions.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/fixtures">Edit predictions</Link>
        </Button>
      </header>

      <section aria-labelledby="standings-heading">
        <h2 id="standings-heading" className="mb-4 text-lg font-semibold">
          Standings
        </h2>
        {!hydrated ? (
          <GroupStandingsTableSkeleton />
        ) : standingsReady ? (
          <GroupStandingsTable standings={standings} teamsById={teamsById} />
        ) : (
          <div className="rounded-lg border border-border bg-surface p-6 text-sm text-text-muted">
            Predict all 6 group matches in{" "}
            <Link href="/fixtures" className="text-gold hover:underline">
              Fixtures
            </Link>{" "}
            to calculate standings for this group.
          </div>
        )}
      </section>

      <section aria-labelledby="matches-heading">
        <h2 id="matches-heading" className="mb-4 text-lg font-semibold">
          Match Results
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!hydrated
            ? Array.from({ length: 6 }).map((_, index) => (
                <MatchCardSkeleton key={index} />
              ))
            : groupMatches.map((match) => {
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
                  <MatchCard
                    key={match.id}
                    match={match}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    venue={venue}
                    prediction={matchPredictions[match.id] ?? null}
                    officialResult={resultsMap[match.id] ?? null}
                  />
                )
              })}
        </div>
      </section>
    </div>
  )
}
