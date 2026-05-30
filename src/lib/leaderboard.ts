import type { LeaderboardEntry } from "../types/leaderboard"

export const CURRENT_USER_ID = "current-user"

export interface RankedLeaderboardEntry extends LeaderboardEntry {
  isCurrentUser: boolean
}

export interface LeaderboardSortableEntry {
  id: string
  displayName: string
  avatarSeed: string
  totalPoints: number
  correctScores: number
  correctResults: number
  groupStagePoints: number
  knockoutPoints: number
  isCurrentUser: boolean
}

/**
 * Merge seeded leaderboard rows with the current user, sort by total points,
 * and assign ranks. On tied points, seeded entries rank above the user.
 */
export function buildRankedLeaderboard(
  seeded: LeaderboardEntry[],
  userEntry: Omit<LeaderboardSortableEntry, "isCurrentUser">,
): RankedLeaderboardEntry[] {
  const combined: LeaderboardSortableEntry[] = [
    ...seeded.map((entry) => ({ ...entry, isCurrentUser: false })),
    { ...userEntry, isCurrentUser: true },
  ]

  combined.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints
    }
    if (a.isCurrentUser && !b.isCurrentUser) return 1
    if (!a.isCurrentUser && b.isCurrentUser) return -1
    return 0
  })

  return combined.map((entry, index) => ({
    id: entry.id,
    displayName: entry.displayName,
    avatarSeed: entry.avatarSeed,
    totalPoints: entry.totalPoints,
    correctScores: entry.correctScores,
    correctResults: entry.correctResults,
    groupStagePoints: entry.groupStagePoints,
    knockoutPoints: entry.knockoutPoints,
    rank: index + 1,
    isCurrentUser: entry.isCurrentUser,
  }))
}
