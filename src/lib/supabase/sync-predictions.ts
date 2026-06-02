"use client"

import { buildEmptyMatchPredictions } from "@/src/lib/default-predictions"
import {
  deleteAllKnockoutPredictions,
  deleteAllMatchPredictions,
  ensureUserJoined,
  fetchUserKnockoutPredictions,
  fetchUserMatchPredictions,
  knockoutRowsToRecord,
  matchRowsToRecord,
  saveKnockoutPrediction,
  savePrediction,
} from "@/src/lib/supabase/predictions"
import { usePredictionsStore } from "@/src/stores/predictions.store"
import type { MatchPrediction } from "@/src/types/predictions"

/** Load DB predictions into the client store (DB wins over local). */
export async function hydratePredictionsFromDatabase(userId: string) {
  const [matchResult, knockoutResult] = await Promise.all([
    fetchUserMatchPredictions(userId),
    fetchUserKnockoutPredictions(userId),
  ])

  if (matchResult.error) throw matchResult.error
  if (knockoutResult.error) throw knockoutResult.error

  const matchRows = matchResult.data ?? []
  const knockoutRows = knockoutResult.data ?? []

  if (matchRows.length === 0 && knockoutRows.length === 0) {
    await pushLocalPredictionsToDatabase(userId)
    return
  }

  const empty = buildEmptyMatchPredictions()
  const matchPredictions = { ...empty, ...matchRowsToRecord(matchRows) }

  usePredictionsStore.getState().hydrateFromDatabase({
    matchPredictions,
    knockoutPredictions: knockoutRowsToRecord(knockoutRows),
  })
}

/** First-time sign-in: upload any local picks that are not in the DB yet. */
export async function pushLocalPredictionsToDatabase(userId: string) {
  const { matchPredictions, knockoutPredictions } =
    usePredictionsStore.getState()

  const upserts: Promise<unknown>[] = []

  for (const [matchId, pred] of Object.entries(matchPredictions)) {
    if (!pred) continue
    upserts.push(savePrediction(userId, matchId, pred))
  }

  for (const [matchId, teamId] of Object.entries(knockoutPredictions)) {
    if (!teamId) continue
    upserts.push(saveKnockoutPrediction(userId, matchId, teamId))
  }

  if (upserts.length > 0) {
    await Promise.all(upserts)
    await ensureUserJoined(userId)
  }
}

export async function resetUserPredictionsInDatabase(userId: string) {
  const [matchResult, knockoutResult] = await Promise.all([
    deleteAllMatchPredictions(userId),
    deleteAllKnockoutPredictions(userId),
  ])

  if (matchResult.error) throw matchResult.error
  if (knockoutResult.error) throw knockoutResult.error
}

export function collectLocalMatchPredictions(
  matchPredictions: Record<string, MatchPrediction | null>,
): Array<{ matchId: string; prediction: MatchPrediction }> {
  return Object.entries(matchPredictions).flatMap(([matchId, prediction]) =>
    prediction ? [{ matchId, prediction }] : [],
  )
}
