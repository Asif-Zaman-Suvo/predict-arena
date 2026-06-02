"use client"

import { supabase } from "@/src/lib/supabase/client"
import type { DatabaseKnockoutPrediction, DatabasePrediction } from "@/src/types/database"
import type { MatchPrediction } from "@/src/types/predictions"

export async function savePrediction(
  userId: string,
  matchId: string,
  prediction: MatchPrediction,
) {
  return supabase.from("predictions").upsert(
    {
      user_id: userId,
      match_id: matchId,
      home_score: prediction.homeScore,
      away_score: prediction.awayScore,
    },
    { onConflict: "user_id,match_id" },
  )
}

export async function deletePrediction(userId: string, matchId: string) {
  return supabase
    .from("predictions")
    .delete()
    .match({ user_id: userId, match_id: matchId })
}

export async function deleteAllMatchPredictions(userId: string) {
  return supabase.from("predictions").delete().eq("user_id", userId)
}

export async function fetchAllMatchPredictions() {
  return supabase.from("predictions").select("*")
}

export async function fetchUserMatchPredictions(userId: string) {
  return supabase.from("predictions").select("*").eq("user_id", userId)
}

export async function saveKnockoutPrediction(
  userId: string,
  matchId: string,
  teamId: string,
) {
  return supabase.from("knockout_predictions").upsert(
    {
      user_id: userId,
      match_id: matchId,
      team_id: teamId,
    },
    { onConflict: "user_id,match_id" },
  )
}

export async function deleteKnockoutPrediction(userId: string, matchId: string) {
  return supabase
    .from("knockout_predictions")
    .delete()
    .match({ user_id: userId, match_id: matchId })
}

export async function deleteAllKnockoutPredictions(userId: string) {
  return supabase.from("knockout_predictions").delete().eq("user_id", userId)
}

export async function fetchUserKnockoutPredictions(userId: string) {
  return supabase.from("knockout_predictions").select("*").eq("user_id", userId)
}

export async function ensureUserJoined(userId: string) {
  const joinedAt = new Date().toISOString()
  return supabase
    .from("users")
    .update({ joined_at: joinedAt })
    .eq("id", userId)
    .is("joined_at", null)
}

export function matchRowsToRecord(
  rows: DatabasePrediction[],
): Record<string, MatchPrediction | null> {
  const record: Record<string, MatchPrediction | null> = {}
  for (const row of rows) {
    record[row.match_id] = {
      homeScore: row.home_score,
      awayScore: row.away_score,
    }
  }
  return record
}

export function knockoutRowsToRecord(
  rows: DatabaseKnockoutPrediction[],
): Record<string, string | null> {
  const record: Record<string, string | null> = {}
  for (const row of rows) {
    record[row.match_id] = row.team_id
  }
  return record
}
