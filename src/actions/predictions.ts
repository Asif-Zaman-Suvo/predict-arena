"use client"

import { simulatePersistDelay } from "@/src/lib/delay"
import { getAuthUserId } from "@/src/lib/supabase/auth-session"
import {
  deletePrediction,
  ensureUserJoined,
  savePrediction,
} from "@/src/lib/supabase/predictions"
import { resetUserPredictionsInDatabase } from "@/src/lib/supabase/sync-predictions"
import { usePredictionsStore } from "@/src/stores/predictions.store"

export interface SubmitMatchPredictionInput {
  matchId: string
  homeScore: number
  awayScore: number
}

export type PredictionActionResult =
  | { ok: true }
  | { ok: false; error: string }

const SIGN_IN_ERROR =
  "Sign in to save predictions to your account and the community."

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

  const userId = await getAuthUserId()
  if (!userId) {
    return { ok: false, error: SIGN_IN_ERROR }
  }

  const { error } = await savePrediction(userId, input.matchId, {
    homeScore,
    awayScore,
  })
  if (error) {
    console.error("Failed to sync prediction:", error)
    return { ok: false, error: "Could not save prediction." }
  }

  await ensureUserJoined(userId)
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

  const userId = await getAuthUserId()
  if (!userId) {
    return { ok: false, error: SIGN_IN_ERROR }
  }

  const { error } = await deletePrediction(userId, matchId)
  if (error) {
    console.error("Failed to delete prediction:", error)
    return { ok: false, error: "Could not clear prediction." }
  }

  return { ok: true }
}

export async function resetAllPredictions(): Promise<PredictionActionResult> {
  const userId = await getAuthUserId()
  if (!userId) {
    return { ok: false, error: "Sign in to reset your saved predictions." }
  }

  await simulatePersistDelay()

  try {
    await resetUserPredictionsInDatabase(userId)
    usePredictionsStore.getState().resetAllPredictions()
    return { ok: true }
  } catch (err) {
    console.error("Failed to reset predictions:", err)
    return { ok: false, error: "Could not reset predictions." }
  }
}
