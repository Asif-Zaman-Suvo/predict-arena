/** Union alias — use for switch/narrowing in application code */
export type Confederation = "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC"
export type MatchStage    = "group" | "r32" | "r16" | "qf" | "sf" | "3rd" | "final"
export type AdvancementStatus = "advances" | "maybe" | "eliminated" | "tbd"

/**
 * JSON-compatible interfaces (discriminant fields typed as string).
 * TypeScript widens literal strings in JSON imports to string, so satisfies
 * against union types would fail. The union aliases above are still used for
 * application-layer narrowing.
 */
export interface Team {
  readonly id: string
  readonly name: string
  readonly shortName: string
  readonly confederation: string   // Confederation at runtime
  readonly flagEmoji: string
  readonly flagCode: string
  readonly fifaRanking: number
  readonly groupId: string
}

export interface Group {
  readonly id: string
  readonly name: string
  readonly teamIds: string[]
}

export interface Match {
  readonly id: string
  readonly stage: string           // MatchStage at runtime
  readonly groupId: string | null
  readonly homeTeamId: string | null
  readonly awayTeamId: string | null
  readonly date: string
  readonly venueId: string
  readonly bracketSlot: string | null
}

export interface Standing {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  advancementStatus: AdvancementStatus
}

/** Ranked third-placed team across all groups. */
export interface BestThirdPlaceEntry {
  rank: number
  teamId: string
  groupId: string
  points: number
  goalDifference: number
  goalsFor: number
  qualifies: boolean
}

/** Auto-derived Round of 32 participant pairing. */
export interface R32Matchup {
  matchId: string
  homeTeamId: string | null
  awayTeamId: string | null
}

export interface Venue {
  readonly id: string
  readonly name: string
  readonly city: string
  readonly country: string         // "USA" | "Canada" | "Mexico" at runtime
  readonly capacity: number
  readonly timezone: string
}
