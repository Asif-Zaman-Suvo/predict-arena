"use client"

import { useMemo } from "react"
import { leaderboard } from "@/src/data"
import {
  computeAllCommunityPicks,
  countActivePredictors,
} from "@/src/lib/community-predictions"
import { usePredictionsOptimistic } from "@/src/components/providers/PredictionsOptimisticProvider"
import { useHydrated } from "@/src/stores/hydration"

const SEEDED_USER_IDS = leaderboard.map((entry) => entry.id)

export function useCommunityPicks() {
  const hydrated = useHydrated()
  const { matchPredictions } = usePredictionsOptimistic()

  const picks = useMemo(
    () =>
      computeAllCommunityPicks(
        SEEDED_USER_IDS,
        hydrated ? matchPredictions : null,
      ),
    [hydrated, matchPredictions],
  )

  const predictorCount = useMemo(
    () =>
      countActivePredictors(
        SEEDED_USER_IDS,
        hydrated ? matchPredictions : null,
      ),
    [hydrated, matchPredictions],
  )

  return {
    picks,
    predictorCount,
    hydrated,
  }
}
