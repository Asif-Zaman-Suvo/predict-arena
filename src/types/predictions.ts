export interface MatchPrediction {
  homeScore: number
  awayScore: number
}

/** Persisted prediction state — group-stage scores only. */
export interface PredictionState {
  matchPredictions: Record<string, MatchPrediction | null>
  knockoutPredictions?: Record<string, string | null>
}

export interface ScoreSummary {
  totalPoints: number
  correctScores: number
  correctResults: number
  groupStagePoints: number
  knockoutPoints: number
}
