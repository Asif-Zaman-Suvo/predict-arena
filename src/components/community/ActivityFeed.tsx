"use client"

import { useMemo, useState } from "react"
import {
  communityFeed,
  leaderboard,
  matches,
  samplePredictions,
  teams,
} from "@/src/data"
import { buildTeamMap } from "@/src/lib/teams"
import { ActivityItem } from "@/src/components/community/ActivityItem"
import { Button } from "@/src/components/ui/button"

const teamsById = buildTeamMap(teams)
const matchesById = Object.fromEntries(matches.map((match) => [match.id, match]))
const usersById = Object.fromEntries(
  leaderboard.map((entry) => [entry.id, entry]),
)

const sortedFeed = [...communityFeed].sort(
  (a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
)

const INITIAL_COUNT = 15

interface ActivityFeedProps {
  skeleton?: boolean
}

export function ActivityFeed({ skeleton = false }: ActivityFeedProps) {
  const [showAll, setShowAll] = useState(false)

  const visibleItems = useMemo(
    () => (showAll ? sortedFeed : sortedFeed.slice(0, INITIAL_COUNT)),
    [showAll],
  )

  if (skeleton) {
    return (
      <div
        className="rounded-lg border border-border bg-surface p-4"
        aria-busy="true"
        aria-label="Loading activity feed"
      >
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex animate-pulse gap-3">
              <div className="h-9 w-9 rounded-full bg-surface-2" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full rounded bg-surface-2" />
                <div className="h-3 w-20 rounded bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section aria-labelledby="activity-feed-heading">
      <h2 id="activity-feed-heading" className="mb-4 text-lg font-semibold">
        Activity Feed
      </h2>

      <div className="rounded-lg border border-border bg-surface px-4">
        <ul aria-live="polite" className="divide-y divide-border">
          {visibleItems.map((item) => {
            const match = item.matchId
              ? matchesById[item.matchId]
              : undefined
            const homeTeam =
              match?.homeTeamId != null
                ? teamsById[match.homeTeamId]
                : undefined
            const awayTeam =
              match?.awayTeamId != null
                ? teamsById[match.awayTeamId]
                : undefined
            const prediction = item.matchId
              ? (samplePredictions.matchPredictions[
                  item.matchId as keyof typeof samplePredictions.matchPredictions
                ] ?? null)
              : null

            return (
              <ActivityItem
                key={item.id}
                item={item}
                user={usersById[item.userId]}
                match={match}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                prediction={prediction}
              />
            )
          })}
        </ul>
      </div>

      {sortedFeed.length > INITIAL_COUNT && (
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll ? "Show less" : "Show more"}
          </Button>
        </div>
      )}
    </section>
  )
}
