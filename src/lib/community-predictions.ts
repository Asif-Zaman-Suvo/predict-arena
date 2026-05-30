import samplePredictionsRaw from "@/src/data/sample-predictions.json"
import { matches } from "@/src/data"
import type { CommunityPickPercentage } from "@/src/types/community"
import type { MatchPrediction } from "@/src/types/predictions"

const samplePredictions = samplePredictionsRaw.matchPredictions as Record<
  string,
  MatchPrediction
>

const GROUP_MATCH_IDS = matches
  .filter((m) => m.stage === "group")
  .map((m) => m.id)

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(99, value))
}

type MatchOutcome = "home" | "draw" | "away"

function outcomeFromPrediction(pred: MatchPrediction): MatchOutcome {
  if (pred.homeScore > pred.awayScore) return "home"
  if (pred.homeScore < pred.awayScore) return "away"
  return "draw"
}

/**
 * Deterministic per-user variation from the reference sample bracket so each
 * leaderboard user has distinct picks without a 20×72 static JSON file.
 */
export function buildSeededUserPredictions(
  userId: string,
): Record<string, MatchPrediction | null> {
  const predictions: Record<string, MatchPrediction | null> = {}

  for (const matchId of GROUP_MATCH_IDS) {
    const base = samplePredictions[matchId]
    if (!base) {
      predictions[matchId] = null
      continue
    }

    const seed = hashString(`${userId}:${matchId}`)
    const homeDelta = (seed % 3) - 1
    const awayDelta = ((seed >> 4) % 3) - 1

    predictions[matchId] = {
      homeScore: clampScore(base.homeScore + homeDelta),
      awayScore: clampScore(base.awayScore + awayDelta),
    }
  }

  return predictions
}

export function getPredictionForUser(
  userId: string,
  matchId: string,
  cache: Map<string, Record<string, MatchPrediction | null>>,
): MatchPrediction | null {
  let userPredictions = cache.get(userId)
  if (!userPredictions) {
    userPredictions = buildSeededUserPredictions(userId)
    cache.set(userId, userPredictions)
  }
  return userPredictions[matchId] ?? null
}

function normalizePercentages(
  home: number,
  draw: number,
  away: number,
  total: number,
): Pick<CommunityPickPercentage, "homePct" | "drawPct" | "awayPct"> {
  if (total === 0) {
    return { homePct: 0, drawPct: 0, awayPct: 0 }
  }

  let homePct = Math.round((home / total) * 100)
  let drawPct = Math.round((draw / total) * 100)
  let awayPct = Math.round((away / total) * 100)
  const drift = 100 - (homePct + drawPct + awayPct)

  if (drift !== 0) {
    const segments = [
      { key: "homePct" as const, count: home },
      { key: "drawPct" as const, count: draw },
      { key: "awayPct" as const, count: away },
    ].sort((a, b) => b.count - a.count)

    const target = segments[0]?.key ?? "homePct"
    if (target === "homePct") homePct += drift
    else if (target === "drawPct") drawPct += drift
    else awayPct += drift
  }

  return { homePct, drawPct, awayPct }
}

/** Aggregate home / draw / away % from all predictors who picked this match. */
export function computeCommunityPickForMatch(
  matchId: string,
  predictorPredictions: Array<Record<string, MatchPrediction | null>>,
): CommunityPickPercentage {
  let home = 0
  let draw = 0
  let away = 0
  let total = 0

  for (const predictions of predictorPredictions) {
    const pred = predictions[matchId]
    if (!pred) continue

    total++
    const outcome = outcomeFromPrediction(pred)
    if (outcome === "home") home++
    else if (outcome === "draw") draw++
    else away++
  }

  const { homePct, drawPct, awayPct } = normalizePercentages(
    home,
    draw,
    away,
    total,
  )

  return { matchId, homePct, drawPct, awayPct }
}

export function computeAllCommunityPicks(
  seededUserIds: string[],
  currentUserPredictions: Record<string, MatchPrediction | null> | null,
): CommunityPickPercentage[] {
  const predictorPredictions = seededUserIds.map((id) =>
    buildSeededUserPredictions(id),
  )

  if (currentUserPredictions) {
    const hasAny = GROUP_MATCH_IDS.some(
      (id) => currentUserPredictions[id] != null,
    )
    if (hasAny) {
      predictorPredictions.push(currentUserPredictions)
    }
  }

  return GROUP_MATCH_IDS.map((matchId) =>
    computeCommunityPickForMatch(matchId, predictorPredictions),
  )
}

export function countActivePredictors(
  seededUserIds: string[],
  currentUserPredictions: Record<string, MatchPrediction | null> | null,
): number {
  let count = seededUserIds.length
  if (
    currentUserPredictions &&
    GROUP_MATCH_IDS.some((id) => currentUserPredictions[id] != null)
  ) {
    count += 1
  }
  return count
}
