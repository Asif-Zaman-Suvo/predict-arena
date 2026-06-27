"use client"

import type { MatchPrediction } from "@/src/types/predictions"
import {
  computeGroupStandings,
  deriveAdvancementStatus,
  computeBestThirdPlaceRanking,
  deriveR32Matchups,
  getBestThirdPlaceTeams,
  isGroupStageComplete,
  isGroupComplete,
  buildPlaceholderGroupStandings,
} from "@/src/lib/tournament"
import { R32_SLOT_DEFINITIONS } from "@/src/lib/r32-slots"
import type { Standing, BestThirdPlaceEntry, R32Matchup } from "@/src/types/tournament"
import groupsData from "../data/groups.json"
import matchesData from "../data/matches.json"
import { usePredictionsOptimistic } from "@/src/components/providers/PredictionsOptimisticProvider"

type GroupStandings = Record<string, Standing[]>

const EMPTY_R32: R32Matchup[] = R32_SLOT_DEFINITIONS.map(({ matchId }) => ({
  matchId,
  homeTeamId: null,
  awayTeamId: null,
}))

export interface TournamentDerived {
  groupStandings: GroupStandings
  groupComplete: Record<string, boolean>
  isGroupStageComplete: boolean
  bestThirdPlaceRanking: BestThirdPlaceEntry[]
  thirdPlaceRanking: BestThirdPlaceEntry[]
  r32Matchups: R32Matchup[]
}

export function computeTournamentDerived(
  matchPredictions: Record<string, MatchPrediction | null>,
): TournamentDerived {
  const groupComplete: Record<string, boolean> = {}
  const raw: GroupStandings = {}

  for (const group of groupsData) {
    const complete = isGroupComplete(group.id, matchPredictions)
    groupComplete[group.id] = complete
    raw[group.id] = complete
      ? computeGroupStandings(group.id, matchesData, matchPredictions)
      : buildPlaceholderGroupStandings(group.id)
  }

  const stageComplete = isGroupStageComplete(matchPredictions)

  if (!stageComplete) {
    return {
      groupStandings: raw,
      groupComplete,
      isGroupStageComplete: false,
      bestThirdPlaceRanking: [],
      thirdPlaceRanking: [],
      r32Matchups: EMPTY_R32,
    }
  }

  const bestThirdPlaceRanking = computeBestThirdPlaceRanking(raw)
  const bestThird = getBestThirdPlaceTeams(raw)

  const groupStandings: GroupStandings = {}
  for (const group of groupsData) {
    groupStandings[group.id] = deriveAdvancementStatus(
      raw[group.id],
      bestThird,
    )
  }

  return {
    groupStandings,
    groupComplete,
    isGroupStageComplete: true,
    bestThirdPlaceRanking,
    thirdPlaceRanking: bestThirdPlaceRanking,
    r32Matchups: deriveR32Matchups(raw),
  }
}

import officialResultsRaw from "../data/results.json"

const officialResults = officialResultsRaw as Record<string, { homeScore: number; awayScore: number }>

/** Merge official results over user predictions — official results always win. */
function mergeWithOfficialResults(
  matchPredictions: Record<string, MatchPrediction | null>,
): Record<string, MatchPrediction | null> {
  const merged = { ...matchPredictions }
  for (const [matchId, result] of Object.entries(officialResults)) {
    merged[matchId] = { homeScore: result.homeScore, awayScore: result.awayScore }
  }
  return merged
}

/** Derived tournament state from optimistic predictions (instant UI). */
export function useTournamentDerived(): TournamentDerived {
  const { matchPredictions } = usePredictionsOptimistic()
  return computeTournamentDerived(mergeWithOfficialResults(matchPredictions))
}
