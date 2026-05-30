"use client"

import { simulatePersistDelay } from "@/src/lib/delay"
import { usePredictionsStore } from "@/src/stores/predictions.store"

export interface SubmitMatchPredictionInput {
  matchId: string
  homeScore: number
  awayScore: number
}

export type PredictionActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function submitMatchPrediction(
  input: SubmitMatchPredictionInput,
): Promise<PredictionActionResult> {
  const homeScore = Math.max(0, Math.min(99, Math.floor(input.homeScore)))
  const awayScore = Math.max(0, Math.min(99, Math.floor(input.awayScore)))

  if (!input.matchId) {
    return { ok: false, error: "Missing match id" }
  }

  await simulatePersistDelay()

  usePredictionsStore
    .getState()
    .setPrediction(input.matchId, homeScore, awayScore)

  return { ok: true }
}

export async function submitMatchPredictionFormAction(
  _prev: PredictionActionResult | null,
  formData: FormData,
): Promise<PredictionActionResult> {
  const matchId = String(formData.get("matchId") ?? "")
  const homeScore = Number(formData.get("homeScore"))
  const awayScore = Number(formData.get("awayScore"))

  if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
    return { ok: false, error: "Invalid score" }
  }

  return submitMatchPrediction({ matchId, homeScore, awayScore })
}

export async function clearMatchPrediction(
  matchId: string,
): Promise<PredictionActionResult> {
  if (!matchId) return { ok: false, error: "Missing match id" }

  await simulatePersistDelay()
  usePredictionsStore.getState().clearPrediction(matchId)
  return { ok: true }
}
