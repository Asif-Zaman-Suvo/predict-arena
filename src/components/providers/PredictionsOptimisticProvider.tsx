"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useOptimisticPredictions } from "@/src/hooks/use-optimistic-predictions"

type PredictionsOptimisticValue = ReturnType<typeof useOptimisticPredictions>

const PredictionsOptimisticContext =
  createContext<PredictionsOptimisticValue | null>(null)

export function PredictionsOptimisticProvider({
  children,
}: {
  children: ReactNode
}) {
  const value = useOptimisticPredictions()

  return (
    <PredictionsOptimisticContext.Provider value={value}>
      {children}
    </PredictionsOptimisticContext.Provider>
  )
}

export function usePredictionsOptimistic(): PredictionsOptimisticValue {
  const ctx = useContext(PredictionsOptimisticContext)
  if (!ctx) {
    throw new Error(
      "usePredictionsOptimistic must be used within PredictionsOptimisticProvider",
    )
  }
  return ctx
}

export function useOptimisticMatchPrediction(matchId: string) {
  const { matchPredictions, submitScore, isPending } =
    usePredictionsOptimistic()

  const prediction = matchPredictions[matchId]
  const hasPrediction = prediction != null

  return {
    prediction,
    hasPrediction,
    displayHome: prediction?.homeScore ?? 0,
    displayAway: prediction?.awayScore ?? 0,
    submitScore: (homeScore: number, awayScore: number) =>
      submitScore(matchId, homeScore, awayScore),
    isPending,
  }
}
