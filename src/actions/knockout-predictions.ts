"use client"

import { simulatePersistDelay } from "@/src/lib/delay"
import { getAuthUserId } from "@/src/lib/supabase/auth-session"
import {
  deleteKnockoutPrediction,
  ensureUserJoined,
  saveKnockoutPrediction,
} from "@/src/lib/supabase/predictions"
import { usePredictionsStore } from "@/src/stores/predictions.store"
import type { PredictionActionResult } from "@/src/actions/predictions"

export async function submitKnockoutPrediction(
  matchId: string,
  teamId: string | null,
): Promise<PredictionActionResult> {
  if (!matchId) return { ok: false, error: "Missing match id" }

  await simulatePersistDelay()

  usePredictionsStore.getState().setKnockoutPrediction(matchId, teamId)

  const userId = await getAuthUserId()
  if (!userId) {
    return {
      ok: false,
      error: "Sign in to save knockout picks to your account.",
    }
  }

  if (teamId) {
    const { error } = await saveKnockoutPrediction(userId, matchId, teamId)
    if (error) {
      console.error("Failed to save knockout prediction:", error)
      return { ok: false, error: "Could not save knockout pick." }
    }
  } else {
    const { error } = await deleteKnockoutPrediction(userId, matchId)
    if (error) {
      console.error("Failed to delete knockout prediction:", error)
      return { ok: false, error: "Could not clear knockout pick." }
    }
  }

  await ensureUserJoined(userId)
  return { ok: true }
}
