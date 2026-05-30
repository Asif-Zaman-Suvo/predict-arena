import type { Team, Group, Match, Venue } from "../types/tournament"
import type { MatchPrediction, PredictionState } from "../types/predictions"
import { buildEmptyMatchPredictions } from "../lib/default-predictions"
import type { LeaderboardEntry } from "../types/leaderboard"
import type { ActivityItem } from "../types/community"
import samplePredictionsRaw from "./sample-predictions.json"

import teamsRaw          from "./teams.json"
import groupsRaw         from "./groups.json"
import matchesRaw        from "./matches.json"
import scheduleRaw       from "./schedule.json"
import leaderboardRaw    from "./leaderboard.json"
import communityFeedRaw  from "./community-feed.json"

export const teams          = teamsRaw          satisfies Team[]
export const groups         = groupsRaw         satisfies Group[]
export const matches        = matchesRaw        satisfies Match[]
export const venues         = scheduleRaw       satisfies Venue[]
export const leaderboard    = leaderboardRaw    satisfies LeaderboardEntry[]
export const samplePredictions: PredictionState = {
  matchPredictions: {
    ...buildEmptyMatchPredictions(),
    ...samplePredictionsRaw.matchPredictions,
  },
}
export const communityFeed = communityFeedRaw satisfies ActivityItem[]
