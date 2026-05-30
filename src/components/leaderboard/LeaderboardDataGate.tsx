"use client"

import { use } from "react"
import { loadLeaderboardBundle } from "@/src/data/loaders"
import { LeaderboardPageContent } from "./LeaderboardPageContent"

/** Suspense gate: simulates async JSON load before rendering leaderboard. */
export function LeaderboardDataGate() {
  use(loadLeaderboardBundle())
  return <LeaderboardPageContent />
}
