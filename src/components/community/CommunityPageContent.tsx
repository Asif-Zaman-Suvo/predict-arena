"use client"

import { leaderboard } from "@/src/data"
import { useCommunityPicks } from "@/src/hooks/use-community-picks"
import { useHydrated } from "@/src/stores/hydration"
import { CommunityPicksSection } from "@/src/components/community/CommunityPicksSection"
import { ActivityFeed } from "@/src/components/community/ActivityFeed"
import { TopPredictors } from "@/src/components/community/TopPredictors"

const topFive = leaderboard.slice(0, 5)

export function CommunityPageContent() {
  const hydrated = useHydrated()
  const { predictorCount } = useCommunityPicks()

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Community Predictions
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {hydrated
            ? `Live split from ${predictorCount} predictors (includes your picks when set)`
            : "Loading community predictions…"}
        </p>
      </header>

      <CommunityPicksSection skeleton={!hydrated} />
      <ActivityFeed skeleton={!hydrated} />
      <TopPredictors entries={topFive} skeleton={!hydrated} />
    </div>
  )
}
