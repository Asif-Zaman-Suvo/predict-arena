"use client"

import { useOptimistic, useTransition } from "react"
import type { MatchPrediction } from "@/src/types/predictions"
import {
  clearMatchPrediction,
  submitMatchPrediction,
} from "@/src/actions/predictions"
import { usePredictionsStore } from "@/src/stores/predictions.store"

type OptimisticPredictionAction =
  | { type: "set"; matchId: string; homeScore: number; awayScore: number }
  | { type: "clear"; matchId: string }

function applyOptimisticPrediction(
  state: Record<string, MatchPrediction | null>,
  action: OptimisticPredictionAction,
): Record<string, MatchPrediction | null> {
  if (action.type === "clear") {
    return { ...state, [action.matchId]: null }
  }
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
      setOptimistic({ type: "set", matchId, homeScore, awayScore })
      await submitMatchPrediction({ matchId, homeScore, awayScore })
    })
  }

  function clearScore(matchId: string) {
    startTransition(async () => {
      setOptimistic({ type: "clear", matchId })
      await clearMatchPrediction(matchId)
    })
  }

  return {
    matchPredictions: optimistic,
    submitScore,
    clearScore,
    isPending,
  }
}
