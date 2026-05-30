import matchesData from "@/src/data/matches.json"
import type { MatchPrediction } from "@/src/types/predictions"

/** Unpredicted — fixtures UI shows empty score inputs until both sides are set. */
export function buildEmptyMatchPredictions(): Record<
  string,
  MatchPrediction | null
> {
  const predictions: Record<string, MatchPrediction | null> = {}

  for (const match of matchesData) {
    if (match.stage === "group") {
      predictions[match.id] = null
    }
  }

  return predictions
}

export function mergeStoredMatchPredictions(
  stored: Record<string, MatchPrediction | null> | undefined,
): Record<string, MatchPrediction | null> {
  const merged = buildEmptyMatchPredictions()

  if (!stored) return merged

  for (const [matchId, prediction] of Object.entries(stored)) {
    if (prediction != null && matchId in merged) {
      merged[matchId] = prediction
    }
  }

  return merged
}

/** Migrate v1 store that pre-filled every match as 0-0. */
export function migrateAllZeroPredictionsToNull(
  stored: Record<string, MatchPrediction | null>,
): Record<string, MatchPrediction | null> {
  const values = Object.values(stored).filter(
    (p): p is MatchPrediction => p != null,
  )
  const groupCount = Object.keys(buildEmptyMatchPredictions()).length

  if (values.length < groupCount) return stored

  const allZero = values.every(
    (p) => p.homeScore === 0 && p.awayScore === 0,
  )

  if (!allZero) return stored

  return buildEmptyMatchPredictions()
}
