"use client"

import { useRef } from "react"
import { useOptimisticLeaderboard } from "@/src/hooks/use-optimistic-leaderboard"
import { LeaderboardRow } from "@/src/components/leaderboard/LeaderboardRow"

function LeaderboardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border"
      aria-busy="true"
      aria-label="Loading scores"
    >
      <div className="border-b border-border bg-surface-2 px-3 py-3 text-sm text-text-muted">
        Loading scores…
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-3 px-3 py-3"
          >
            <div className="h-4 w-6 rounded bg-surface-2" />
            <div className="h-8 w-8 rounded-full bg-surface-2" />
            <div className="h-4 flex-1 rounded bg-surface-2" />
            <div className="h-4 w-10 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LeaderboardTable() {
  const { entries, hydrated } = useOptimisticLeaderboard()
  const scrolledRef = useRef(false)

  function scrollUserRow(node: HTMLTableRowElement | null) {
    if (!node || !hydrated || scrolledRef.current) return
    scrolledRef.current = true
    node.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  if (!hydrated) {
    return <LeaderboardSkeleton />
  }

  return (
    <div className="w-full max-w-full overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
            <th className="px-3 py-3 font-medium">Rank</th>
            <th className="px-3 py-3 font-medium">
              <span className="sr-only">Avatar</span>
            </th>
            <th className="px-3 py-3 font-medium">Name</th>
            <th className="hidden px-3 py-3 text-center font-medium sm:table-cell">
              Scores
            </th>
            <th className="hidden px-3 py-3 text-center font-medium sm:table-cell">
              Results
            </th>
            <th className="px-3 py-3 text-right font-medium">Points</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              index={index}
              ref={entry.isCurrentUser ? scrollUserRow : undefined}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
