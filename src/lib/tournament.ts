import type { Match, Standing, BestThirdPlaceEntry, R32Matchup } from "../types/tournament"
import type { MatchPrediction } from "../types/predictions"
import teamsData from "../data/teams.json"
import groupsData from "../data/groups.json"
import matchesData from "../data/matches.json"
import {
  R32_SLOT_DEFINITIONS,
  type R32SlotTeamRef,
} from "./r32-slots"

// ─── Internal helpers ────────────────────────────────────────────────────────

function initStanding(teamId: string): Standing {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    advancementStatus: "tbd",
  }
}

function applyResult(
  standings: Record<string, Standing>,
  homeTeamId: string,
  awayTeamId: string,
  pred: MatchPrediction,
): void {
  const home = standings[homeTeamId]
  const away = standings[awayTeamId]
  const { homeScore, awayScore } = pred

  home.played++
  away.played++
  home.goalsFor += homeScore
  home.goalsAgainst += awayScore
  away.goalsFor += awayScore
  away.goalsAgainst += homeScore
  home.goalDifference = home.goalsFor - home.goalsAgainst
  away.goalDifference = away.goalsFor - away.goalsAgainst

  if (homeScore > awayScore) {
    home.won++
    home.points += 3
    away.lost++
  } else if (homeScore < awayScore) {
    away.won++
    away.points += 3
    home.lost++
  } else {
    home.drawn++
    home.points += 1
    away.drawn++
    away.points += 1
  }
}

/**
 * Compute head-to-head stats for a subset of teams.
 * Used as the 4th tiebreaker after Pts → GD → GF.
 */
function h2hStats(
  teamIds: string[],
  matches: Match[],
  predictions: Record<string, MatchPrediction | null>,
): Record<string, { pts: number; gd: number; gf: number }> {
  const stats: Record<string, { pts: number; gd: number; gf: number }> = {}
  for (const id of teamIds) stats[id] = { pts: 0, gd: 0, gf: 0 }

  for (const match of matches) {
    const { homeTeamId, awayTeamId, id } = match
    if (!homeTeamId || !awayTeamId) continue
    if (!teamIds.includes(homeTeamId) || !teamIds.includes(awayTeamId)) continue

    const pred = predictions[id]
    if (!pred) continue

    const { homeScore, awayScore } = pred
    stats[homeTeamId].gf += homeScore
    stats[homeTeamId].gd += homeScore - awayScore
    stats[awayTeamId].gf += awayScore
    stats[awayTeamId].gd += awayScore - homeScore

    if (homeScore > awayScore) stats[homeTeamId].pts += 3
    else if (homeScore < awayScore) stats[awayTeamId].pts += 3
    else {
      stats[homeTeamId].pts += 1
      stats[awayTeamId].pts += 1
    }
  }

  return stats
}

function fifaRanking(teamId: string): number {
  return teamsData.find((t) => t.id === teamId)?.fifaRanking ?? 999
}

// ─── Exports ─────────────────────────────────────────────────────────────────

/**
 * Compute sorted group standings from the user's match predictions.
 * Tiebreaker order: points → GD → GF → head-to-head (pts, GD, GF) → FIFA ranking.
 * Returns standings with advancementStatus set to "tbd" — call deriveAdvancementStatus() next.
 */
export function computeGroupStandings(
  groupId: string,
  matches: Match[],
  predictions: Record<string, MatchPrediction | null>,
): Standing[] {
  const groupMatches = matches.filter(
    (m) => m.groupId === groupId && m.stage === "group",
  )

  const standings: Record<string, Standing> = {}
  for (const m of groupMatches) {
    if (m.homeTeamId && !standings[m.homeTeamId])
      standings[m.homeTeamId] = initStanding(m.homeTeamId)
    if (m.awayTeamId && !standings[m.awayTeamId])
      standings[m.awayTeamId] = initStanding(m.awayTeamId)
  }

  for (const match of groupMatches) {
    if (!match.homeTeamId || !match.awayTeamId) continue
    const pred = predictions[match.id]
    if (!pred) continue
    applyResult(standings, match.homeTeamId, match.awayTeamId, pred)
  }

  const list = Object.values(standings)

  list.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor

    // Head-to-head tiebreaker
    const h2h = h2hStats([a.teamId, b.teamId], groupMatches, predictions)
    if (h2h[b.teamId].pts !== h2h[a.teamId].pts)
      return h2h[b.teamId].pts - h2h[a.teamId].pts
    if (h2h[b.teamId].gd !== h2h[a.teamId].gd)
      return h2h[b.teamId].gd - h2h[a.teamId].gd
    if (h2h[b.teamId].gf !== h2h[a.teamId].gf)
      return h2h[b.teamId].gf - h2h[a.teamId].gf

    return fifaRanking(a.teamId) - fifaRanking(b.teamId)
  })

  return list
}

/**
 * Assign advancementStatus to each team based on their position in the group.
 * Positions 1–2 advance automatically. Position 3 advances only if in the
 * top-8 best-third ranking; otherwise eliminated.
 */
export function deriveAdvancementStatus(
  standings: Standing[],
  bestThirdTeamIds: string[] = [],
): Standing[] {
  return standings.map((s, i) => {
    let status: Standing["advancementStatus"] = "eliminated"
    if (i < 2) {
      status = "advances"
    } else if (i === 2) {
      status = bestThirdTeamIds.includes(s.teamId) ? "advances" : "eliminated"
    }
    return { ...s, advancementStatus: status }
  })
}

/**
 * Rank all 12 third-placed teams. Top 8 qualify for the Round of 32.
 * Tiebreaker: points → GD → GF → FIFA ranking.
 */
export function computeBestThirdPlaceRanking(
  allGroupStandings: Record<string, Standing[]>,
): BestThirdPlaceEntry[] {
  const thirds = Object.entries(allGroupStandings)
    .map(([groupId, standings]) => {
      const third = standings[2]
      if (!third) return null
      return { ...third, groupId }
    })
    .filter((entry): entry is Standing & { groupId: string } => entry !== null)

  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
    return fifaRanking(a.teamId) - fifaRanking(b.teamId)
  })

  return thirds.map((entry, index) => ({
    rank: index + 1,
    teamId: entry.teamId,
    groupId: entry.groupId,
    points: entry.points,
    goalDifference: entry.goalDifference,
    goalsFor: entry.goalsFor,
    qualifies: index < 8,
  }))
}

/**
 * Identify the 8 best third-place teams across all 12 groups.
 */
export function getBestThirdPlaceTeams(
  allGroupStandings: Record<string, Standing[]>,
): string[] {
  return computeBestThirdPlaceRanking(allGroupStandings)
    .filter((entry) => entry.qualifies)
    .map((entry) => entry.teamId)
}

function resolveFixedSlot(
  ref: Extract<R32SlotTeamRef, { type: "winner" | "runner-up" }>,
  allGroupStandings: Record<string, Standing[]>,
): string | null {
  const standings = allGroupStandings[ref.groupId]
  if (!standings?.length) return null
  const index = ref.type === "winner" ? 0 : 1
  return standings[index]?.teamId ?? null
}

function resolveThirdSlot(
  candidateGroups: string[],
  rankedThirds: BestThirdPlaceEntry[],
  assignedThirdIds: Set<string>,
): string | null {
  for (const entry of rankedThirds) {
    if (!entry.qualifies) continue
    if (assignedThirdIds.has(entry.teamId)) continue
    if (!candidateGroups.includes(entry.groupId)) continue
    assignedThirdIds.add(entry.teamId)
    return entry.teamId
  }
  return null
}

function resolveSlotTeam(
  ref: R32SlotTeamRef,
  allGroupStandings: Record<string, Standing[]>,
  rankedThirds: BestThirdPlaceEntry[],
  assignedThirdIds: Set<string>,
): string | null {
  if (ref.type === "third") {
    return resolveThirdSlot(ref.candidateGroups, rankedThirds, assignedThirdIds)
  }
  return resolveFixedSlot(ref, allGroupStandings)
}

/**
 * Derive Round of 32 participants from computed group standings.
 * Winners and runners-up come directly from standings; third-place slots
 * are filled from the best-third ranking in bracket slot order.
 */
export function deriveR32Matchups(
  allGroupStandings: Record<string, Standing[]>,
): R32Matchup[] {
  const rankedThirds = computeBestThirdPlaceRanking(allGroupStandings)
  const assignedThirdIds = new Set<string>()

  return R32_SLOT_DEFINITIONS.map(({ matchId, home, away }) => ({
    matchId,
    homeTeamId: resolveSlotTeam(
      home,
      allGroupStandings,
      rankedThirds,
      assignedThirdIds,
    ),
    awayTeamId: resolveSlotTeam(
      away,
      allGroupStandings,
      rankedThirds,
      assignedThirdIds,
    ),
  }))
}

export const GROUP_MATCH_COUNT = matchesData.filter(
  (m) => m.stage === "group",
).length

const GROUP_MATCHES_BY_GROUP = Object.fromEntries(
  groupsData.map((group) => [
    group.id,
    matchesData.filter((m) => m.groupId === group.id && m.stage === "group"),
  ]),
)

export function isGroupComplete(
  groupId: string,
  predictions: Record<string, MatchPrediction | null>,
): boolean {
  return GROUP_MATCHES_BY_GROUP[groupId].every((m) => predictions[m.id] != null)
}

/** Alphabetical placeholder before a group has all 6 predictions. */
export function buildPlaceholderGroupStandings(groupId: string): Standing[] {
  const group = groupsData.find((g) => g.id === groupId)
  if (!group) return []

  return [...group.teamIds]
    .sort((a, b) => {
      const nameA = teamsData.find((t) => t.id === a)?.name ?? a
      const nameB = teamsData.find((t) => t.id === b)?.name ?? b
      return nameA.localeCompare(nameB)
    })
    .map((teamId) => initStanding(teamId))
}

export function isGroupStageComplete(
  predictions: Record<string, MatchPrediction | null>,
): boolean {
  const groupMatches = matchesData.filter((m) => m.stage === "group")
  return groupMatches.every((m) => predictions[m.id] != null)
}

export function countCompletedGroupPredictions(
  predictions: Record<string, MatchPrediction | null>,
): number {
  return matchesData.filter(
    (m) => m.stage === "group" && predictions[m.id] != null,
  ).length
}
