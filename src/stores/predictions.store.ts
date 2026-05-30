"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { MatchPrediction } from "../types/predictions"
import {
  buildEmptyMatchPredictions,
  mergeStoredMatchPredictions,
  migrateAllZeroPredictionsToNull,
} from "../lib/default-predictions"
import { isGroupStageComplete } from "../lib/tournament"

interface PredictionsState {
  matchPredictions: Record<string, MatchPrediction | null>
  knockoutPredictions: Record<string, string | null>
}

interface PredictionsActions {
  setPrediction: (matchId: string, homeScore: number, awayScore: number) => void
  clearPrediction: (matchId: string) => void
  setKnockoutPrediction: (matchId: string, teamId: string | null) => void
}

export type PredictionsStore = PredictionsState & PredictionsActions

/** Primary prediction store — group scores + knockout winner picks. */
export const usePredictionsStore = create<PredictionsStore>()(
  persist(
    (set) => ({
      matchPredictions: buildEmptyMatchPredictions(),
      knockoutPredictions: {},

      setPrediction: (matchId, homeScore, awayScore) =>
        set((state) => {
          const matchPredictions = {
            ...state.matchPredictions,
            [matchId]: { homeScore, awayScore },
          }
          return {
            matchPredictions,
            knockoutPredictions: isGroupStageComplete(matchPredictions)
              ? state.knockoutPredictions
              : {},
          }
        }),

      clearPrediction: (matchId) =>
        set((state) => {
          const matchPredictions = {
            ...state.matchPredictions,
            [matchId]: null,
          }
          return {
            matchPredictions,
            knockoutPredictions: isGroupStageComplete(matchPredictions)
              ? state.knockoutPredictions
              : {},
          }
        }),

      setKnockoutPrediction: (matchId, teamId) =>
        set((state) => ({
          knockoutPredictions: {
            ...state.knockoutPredictions,
            [matchId]: teamId,
          },
        })),
    }),
    {
      name: "pa:predictions",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        matchPredictions: state.matchPredictions,
        knockoutPredictions: state.knockoutPredictions,
      }),
      migrate: (persisted, version) => {
        const state = persisted as PredictionsState | undefined
        if (!state?.matchPredictions) {
          return {
            matchPredictions: buildEmptyMatchPredictions(),
            knockoutPredictions: state?.knockoutPredictions ?? {},
          }
        }
        if (version < 2) {
          return {
            matchPredictions: migrateAllZeroPredictionsToNull(
              state.matchPredictions,
            ),
            knockoutPredictions: state.knockoutPredictions ?? {},
          }
        }
        return state
      },
      merge: (persisted, current) => ({
        ...current,
        matchPredictions: mergeStoredMatchPredictions(
          (persisted as PredictionsState | undefined)?.matchPredictions,
        ),
        knockoutPredictions:
          (persisted as PredictionsState | undefined)?.knockoutPredictions ??
          {},
      }),
    },
  ),
)

export const usePredictionStore = usePredictionsStore
