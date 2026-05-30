import type { PredictionState, ScoreSummary, MatchPrediction } from "../types/predictions"
import resultsRaw from "../data/results.json"

const results = resultsRaw as Record<string, MatchPrediction>

type Outcome = "H" | "D" | "A"

function outcome(home: number, away: number): Outcome {
  if (home > away) return "H"
  if (home < away) return "A"
  return "D"
}

/**
 * Compute a user's score summary by comparing their match predictions
 * against the mock results in results.json.
 *
 * Scoring rules:
 *   Exact correct score  → 3 pts (counted in correctScores + groupStagePoints)
 *   Correct result only  → 1 pt  (counted in correctResults + groupStagePoints)
 *   Knockout predictions → not scored (no actual results in mock data)
 */
export function computeUserScore(predictions: PredictionState): ScoreSummary {
  let correctScores = 0
  let correctResults = 0
  let groupStagePoints = 0

  for (const [matchId, userPred] of Object.entries(
    predictions.matchPredictions,
  )) {
    if (!userPred) continue
    const result = results[matchId]
    if (!result) continue

    const isExact =
      userPred.homeScore === result.homeScore &&
      userPred.awayScore === result.awayScore

    if (isExact) {
      correctScores++
      groupStagePoints += 3
    } else if (
      outcome(userPred.homeScore, userPred.awayScore) ===
      outcome(result.homeScore, result.awayScore)
    ) {
      correctResults++
      groupStagePoints += 1
    }
  }

  return {
    totalPoints: groupStagePoints,
    correctScores,
    correctResults,
    groupStagePoints,
    knockoutPoints: 0,
  }
}
