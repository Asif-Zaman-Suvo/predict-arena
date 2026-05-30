"use client"

import { LeaderboardTable } from "@/src/components/leaderboard/LeaderboardTable"

export function LeaderboardPageContent() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        <p className="mt-1 text-sm text-text-muted">
          Live standings from your group-stage predictions against mock results.
        </p>
      </header>

      <LeaderboardTable />
    </div>
  )
}
