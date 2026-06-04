import type { Match } from "../types/tournament"
import { matches } from "../data"

export type KnockoutStage = "r32" | "r16" | "qf" | "sf" | "3rd" | "final"

export interface BracketRoundConfig {
  stage: KnockoutStage
  label: string
  shortLabel: string
}

export const BRACKET_ROUNDS: BracketRoundConfig[] = [
  { stage: "r32", label: "Round of 32", shortLabel: "R32" },
  { stage: "r16", label: "Round of 16", shortLabel: "R16" },
  { stage: "qf", label: "Quarterfinals", shortLabel: "QF" },
  { stage: "sf", label: "Semifinals", shortLabel: "SF" },
  { stage: "3rd", label: "Third Place", shortLabel: "3rd" },
  { stage: "final", label: "Final", shortLabel: "Final" },
]

/** Knockout columns in bracket UI (3rd place is rendered above final, no connectors). */
export const BRACKET_MAIN_ROUNDS = BRACKET_ROUNDS.filter(
  (round) => round.stage !== "3rd",
)

export interface ResolvedBracketMatch {
  id: string
  stage: KnockoutStage
  bracketSlot: string
  homeTeamId: string | null
  awayTeamId: string | null
  winnerTeamId: string | null
}

const KNOCKOUT_MATCHES = matches.filter((match) => match.stage !== "group")

function parseIndex(matchId: string): number {
  const part = matchId.split("-").pop()
  return Number.parseInt(part ?? "0", 10)
}

function feederIds(matchId: string): [string, string] | null {
  if (matchId.startsWith("k-r16-")) {
    const index = parseIndex(matchId)
    return [`k-r32-${index * 2 - 1}`, `k-r32-${index * 2}`]
  }

  if (matchId.startsWith("k-qf-")) {
    const index = parseIndex(matchId)
    return [`k-r16-${index * 2 - 1}`, `k-r16-${index * 2}`]
  }

  if (matchId.startsWith("k-sf-")) {
    const index = parseIndex(matchId)
    return [`k-qf-${index * 2 - 1}`, `k-qf-${index * 2}`]
  }

  if (matchId === "k-final-1") {
    return ["k-sf-1", "k-sf-2"]
  }

  if (matchId === "k-3rd-1") {
    return ["k-sf-1", "k-sf-2"]
  }

  return null
}

function loser(
  matchId: string,
  predictions: Record<string, string | null>,
  r32Matchups: Record<
    string,
    { homeTeamId: string | null; awayTeamId: string | null }
  >,
): string | null {
  const resolved = resolveSingleMatch(matchId, predictions, r32Matchups)
  const winner = predictions[matchId]
  if (!winner) return null

  if (resolved.homeTeamId === winner) return resolved.awayTeamId
  if (resolved.awayTeamId === winner) return resolved.homeTeamId
  return null
}

function resolveSingleMatch(
  matchId: string,
  predictions: Record<string, string | null>,
  r32Matchups: Record<
    string,
    { homeTeamId: string | null; awayTeamId: string | null }
  >,
): ResolvedBracketMatch {
  const match = KNOCKOUT_MATCHES.find((entry) => entry.id === matchId)
  const stage = (match?.stage ?? "r32") as KnockoutStage
  const feeders = feederIds(matchId)

  if (!feeders) {
    const r32 = r32Matchups[matchId]
    return {
      id: matchId,
      stage,
      bracketSlot: match?.bracketSlot ?? matchId,
      homeTeamId: r32?.homeTeamId ?? match?.homeTeamId ?? null,
      awayTeamId: r32?.awayTeamId ?? match?.awayTeamId ?? null,
      winnerTeamId: predictions[matchId] ?? null,
    }
  }

  if (matchId === "k-3rd-1") {
    return {
      id: matchId,
      stage,
      bracketSlot: match?.bracketSlot ?? matchId,
      homeTeamId: loser(feeders[0], predictions, r32Matchups),
      awayTeamId: loser(feeders[1], predictions, r32Matchups),
      winnerTeamId: predictions[matchId] ?? null,
    }
  }

  return {
    id: matchId,
    stage,
    bracketSlot: match?.bracketSlot ?? matchId,
    homeTeamId: predictions[feeders[0]] ?? null,
    awayTeamId: predictions[feeders[1]] ?? null,
    winnerTeamId: predictions[matchId] ?? null,
  }
}

export function resolveBracket(
  predictions: Record<string, string | null>,
  r32Matchups: Record<string, { homeTeamId: string | null; awayTeamId: string | null }> = {},
): Record<KnockoutStage, ResolvedBracketMatch[]> {
  const byStage: Record<KnockoutStage, ResolvedBracketMatch[]> = {
    r32: [],
    r16: [],
    qf: [],
    sf: [],
    "3rd": [],
    final: [],
  }

  for (const match of KNOCKOUT_MATCHES) {
    const stage = match.stage as KnockoutStage
    byStage[stage].push(
      resolveSingleMatch(match.id, predictions, r32Matchups),
    )
  }

  for (const stage of Object.keys(byStage) as KnockoutStage[]) {
    byStage[stage].sort(
      (a, b) => parseIndex(a.id) - parseIndex(b.id),
    )
  }

  return byStage
}

/** Team row height in BracketMatch (h-11 for touch targets). */
export const BRACKET_ROW_HEIGHT = 44

/** Match card: 1px borders + p-2 + gap-1 + two team rows */
export const BRACKET_MATCH_HEIGHT =
  2 + 16 + 4 + BRACKET_ROW_HEIGHT * 2

/** Round label (text-xs line + mb-3) above the match column */
export const BRACKET_ROUND_LABEL_HEIGHT = 28

/** Space between third-place and final cards in the final column */
export const BRACKET_3RD_FINAL_GAP = 24

const BASE_MATCH_GAP = 8

export function getRoundGap(roundIndex: number): number {
  if (roundIndex === 0) return BASE_MATCH_GAP

  const previousGap = getRoundGap(roundIndex - 1)
  return (
    (BRACKET_MATCH_HEIGHT + previousGap) * 2 - BRACKET_MATCH_HEIGHT
  )
}

/** Top margin for the first match in a round (aligns with feeder pair midpoint). */
export function getFirstMatchMarginTop(roundIndex: number): number {
  if (roundIndex === 0) return 0
  return BRACKET_MATCH_HEIGHT + getRoundGap(roundIndex - 1)
}

/** Center Y of a match within the match column (below the round label). */
export function getMatchCenterY(roundIndex: number, matchIndex: number): number {
  const gap = getRoundGap(roundIndex)
  const lead = getFirstMatchMarginTop(roundIndex)
  return (
    lead + matchIndex * (BRACKET_MATCH_HEIGHT + gap) + BRACKET_MATCH_HEIGHT / 2
  )
}

/** Total height of the match column for a round (connector SVG height). */
export function getRoundColumnHeight(
  matchCount: number,
  roundIndex: number,
): number {
  if (matchCount === 0) return 0
  const gap = getRoundGap(roundIndex)
  const lead = getFirstMatchMarginTop(roundIndex)
  return lead + matchCount * BRACKET_MATCH_HEIGHT + (matchCount - 1) * gap
}

/** Y offset from column top to final match top (aligned with SF feeder midpoint). */
export function getFinalMatchTopOffset(finalRoundIndex: number): number {
  return (
    BRACKET_ROUND_LABEL_HEIGHT + getFirstMatchMarginTop(finalRoundIndex)
  )
}

export function getFinalRunnerUpId(
  finalMatch: ResolvedBracketMatch,
  championTeamId: string | null,
): string | null {
  if (!championTeamId) return null
  if (finalMatch.homeTeamId === championTeamId) return finalMatch.awayTeamId
  if (finalMatch.awayTeamId === championTeamId) return finalMatch.homeTeamId
  return null
}

export function buildMatchAriaLabel(
  roundLabel: string,
  matchIndex: number,
  homeName: string,
  awayName: string,
): string {
  return `${roundLabel} Match ${matchIndex + 1}: ${homeName} vs ${awayName}`
}

export function getKnockoutMatchesByStage(stage: KnockoutStage): Match[] {
  return KNOCKOUT_MATCHES.filter((match) => match.stage === stage).sort(
    (a, b) => parseIndex(a.id) - parseIndex(b.id),
  )
}
