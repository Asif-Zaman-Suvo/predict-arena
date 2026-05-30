"use client"

import { leaderboard } from "@/src/data"
import { computeUserScore } from "@/src/lib/scoring"
import {
  buildRankedLeaderboard,
  CURRENT_USER_ID,
  type RankedLeaderboardEntry,
} from "@/src/lib/leaderboard"
import { usePredictionsOptimistic } from "@/src/components/providers/PredictionsOptimisticProvider"
import { useUserStore } from "./user.store"
import { usePersistHydrated } from "./persist-hydration"

export function computeLeaderboardEntries(
  matchPredictions: Record<
    string,
    import("../types/predictions").MatchPrediction | null
  >,
  displayName: string,
  avatarSeed: string,
): RankedLeaderboardEntry[] {
  const score = computeUserScore({ matchPredictions })

  return buildRankedLeaderboard(leaderboard, {
    id: CURRENT_USER_ID,
    displayName: displayName.trim() || "You",
    avatarSeed,
    totalPoints: score.totalPoints,
    correctScores: score.correctScores,
    correctResults: score.correctResults,
    groupStagePoints: score.groupStagePoints,
    knockoutPoints: score.knockoutPoints,
  })
}

export function useLeaderboardEntries(): RankedLeaderboardEntry[] {
  const hydrated = usePersistHydrated()
  const { matchPredictions } = usePredictionsOptimistic()
  const displayName = useUserStore((s) => s.displayName)
  const avatarSeed = useUserStore((s) => s.avatarSeed)

  if (!hydrated) return []

  return computeLeaderboardEntries(
    matchPredictions,
    displayName,
    avatarSeed,
  )
}
