/** Union alias — use for switch/narrowing in application code */
export type ActivityType = "prediction" | "comment" | "join"

export interface CommunityPickPercentage {
  readonly matchId: string
  readonly homePct: number
  readonly drawPct: number
  readonly awayPct: number
}

export interface ActivityItem {
  readonly id: string
  readonly userId: string
  readonly type: string        // ActivityType at runtime
  readonly matchId?: string
  readonly content?: string
  readonly timestamp: string
}
