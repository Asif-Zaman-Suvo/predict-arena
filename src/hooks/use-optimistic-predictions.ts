"use client"

import { useOptimistic, useTransition } from "react"
import type { MatchPrediction } from "@/src/types/predictions"
import { submitMatchPrediction } from "@/src/actions/predictions"
import { usePredictionsStore } from "@/src/stores/predictions.store"

type OptimisticPredictionAction = {
  matchId: string
  homeScore: number
  awayScore: number
}

function applyOptimisticPrediction(
  state: Record<string, MatchPrediction | null>,
  action: OptimisticPredictionAction,
): Record<string, MatchPrediction | null> {
  return {
    ...state,
    [action.matchId]: {
      homeScore: action.homeScore,
      awayScore: action.awayScore,
    },
  }
}

/**
 * Optimistic match predictions: instant UI, then persisted via action + Zustand.
 */
export function useOptimisticPredictions() {
  const stored = usePredictionsStore((s) => s.matchPredictions)
  const [optimistic, setOptimistic] = useOptimistic(
    stored,
    applyOptimisticPrediction,
  )
  const [isPending, startTransition] = useTransition()

  function submitScore(
    matchId: string,
    homeScore: number,
    awayScore: number,
  ) {
    startTransition(async () => {
      setOptimistic({ matchId, homeScore, awayScore })
      await submitMatchPrediction({ matchId, homeScore, awayScore })
    })
  }

  return {
    matchPredictions: optimistic,
    submitScore,
    isPending,
  }
}
