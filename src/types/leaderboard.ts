export interface LeaderboardEntry {
  readonly id: string
  readonly displayName: string
  readonly avatarSeed: string
  readonly totalPoints: number
  readonly correctScores: number
  readonly correctResults: number
  readonly groupStagePoints: number
  readonly knockoutPoints: number
  readonly rank: number
}
