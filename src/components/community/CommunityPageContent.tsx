"use client"

import { leaderboard } from "@/src/data"
import { useHydrated } from "@/src/stores/hydration"
import { CommunityPicksSection } from "@/src/components/community/CommunityPicksSection"
import { ActivityFeed } from "@/src/components/community/ActivityFeed"
import { TopPredictors } from "@/src/components/community/TopPredictors"

const topFive = leaderboard.slice(0, 5)

export function CommunityPageContent() {
  const hydrated = useHydrated()

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Community Predictions
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          See what 20 predictors are calling for World Cup 2026
        </p>
      </header>

      <CommunityPicksSection skeleton={!hydrated} />
      <ActivityFeed skeleton={!hydrated} />
      <TopPredictors entries={topFive} skeleton={!hydrated} />
    </div>
  )
}
