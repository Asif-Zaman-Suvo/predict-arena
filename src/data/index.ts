import type { Team, Group, Match, Venue } from "../types/tournament"
import type { MatchPrediction, PredictionState } from "../types/predictions"
import { buildEmptyMatchPredictions } from "../lib/default-predictions"
import samplePredictionsRaw from "./sample-predictions.json"

import teamsRaw          from "./teams.json"
import groupsRaw         from "./groups.json"
import matchesRaw        from "./matches.json"
import scheduleRaw       from "./schedule.json"

export const teams          = teamsRaw          satisfies Team[]
export const groups         = groupsRaw         satisfies Group[]
export const matches        = matchesRaw        satisfies Match[]
export const venues         = scheduleRaw       satisfies Venue[]
export const samplePredictions: PredictionState = {
  matchPredictions: {
    ...buildEmptyMatchPredictions(),
    ...samplePredictionsRaw.matchPredictions,
  },
}
