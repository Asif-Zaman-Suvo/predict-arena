"use client"

import { useOptimistic } from "react"
import type { RankedLeaderboardEntry } from "@/src/lib/leaderboard"
import { computeLeaderboardEntries } from "@/src/stores/leaderboard.selectors"
import { usePredictionsOptimistic } from "@/src/components/providers/PredictionsOptimisticProvider"
import { useUserStore } from "@/src/stores/user.store"
import { usePersistHydrated } from "@/src/stores/persist-hydration"

type LeaderboardOptimisticAction = RankedLeaderboardEntry[]

function replaceLeaderboard(
  _current: RankedLeaderboardEntry[],
  next: LeaderboardOptimisticAction,
): RankedLeaderboardEntry[] {
  return next
}

/**
 * Leaderboard rows derived from predictions; recompute when store updates.
 */
export function useOptimisticLeaderboard() {
  const hydrated = usePersistHydrated()
  const { matchPredictions } = usePredictionsOptimistic()
  const displayName = useUserStore((s) => s.displayName)
  const avatarSeed = useUserStore((s) => s.avatarSeed)

  const baseEntries = hydrated
    ? computeLeaderboardEntries(matchPredictions, displayName, avatarSeed)
    : []

  const [entries] = useOptimistic(baseEntries, replaceLeaderboard)

  return { entries, hydrated }
}
