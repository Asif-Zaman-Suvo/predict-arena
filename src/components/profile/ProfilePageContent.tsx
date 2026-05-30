"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { leaderboard } from "@/src/data"
import { getDiceBearAvatarUrl } from "@/src/lib/avatars"
import {
  buildRankedLeaderboard,
  CURRENT_USER_ID,
} from "@/src/lib/leaderboard"
import { GROUP_MATCH_COUNT, countCompletedGroupPredictions } from "@/src/lib/tournament"
import { computeUserScore } from "@/src/lib/scoring"
import { usePredictionsOptimistic } from "@/src/components/providers/PredictionsOptimisticProvider"
import { useTournamentDerived } from "@/src/stores/tournament.selectors"
import { useUserStore } from "@/src/stores/user.store"
import { useHydrated } from "@/src/stores/hydration"
import { PredictionSummary } from "@/src/components/predictions/PredictionSummary"
import { ProfileNameForm } from "@/src/components/profile/ProfileNameForm"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"

function StatCard({
  label,
  value,
  skeleton,
}: {
  label: string
  value: string
  skeleton?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
      {skeleton ? (
        <div className="mt-2 h-7 w-16 animate-pulse rounded bg-surface-2" />
      ) : (
        <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      )}
    </div>
  )
}

function computeProfileStats(
  hydrated: boolean,
  matchPredictions: ReturnType<
    typeof usePredictionsOptimistic
  >["matchPredictions"],
  r32Matchups: ReturnType<typeof useTournamentDerived>["r32Matchups"],
  thirdPlaceRanking: ReturnType<typeof useTournamentDerived>["thirdPlaceRanking"],
  displayName: string,
  avatarSeed: string,
) {
  if (!hydrated) return null

  const groupCompleted = countCompletedGroupPredictions(matchPredictions)
  const r32Ready = r32Matchups.filter(
    (m) => m.homeTeamId && m.awayTeamId,
  ).length
  const qualifiedThirds = thirdPlaceRanking.filter((e) => e.qualifies).length

  const score = computeUserScore({ matchPredictions })

  const ranked = buildRankedLeaderboard(leaderboard, {
    id: CURRENT_USER_ID,
    displayName: displayName.trim() || "You",
    avatarSeed,
    totalPoints: score.totalPoints,
    correctScores: score.correctScores,
    correctResults: score.correctResults,
    groupStagePoints: score.groupStagePoints,
    knockoutPoints: score.knockoutPoints,
  })

  const userRank =
    ranked.find((entry) => entry.isCurrentUser)?.rank ?? ranked.length

  return {
    groupCompleted,
    r32Ready,
    qualifiedThirds,
    score: score.totalPoints,
    rank: userRank,
  }
}

export function ProfilePageContent() {
  const hydrated = useHydrated()
  const { matchPredictions } = usePredictionsOptimistic()
  const { r32Matchups, thirdPlaceRanking } = useTournamentDerived()
  const displayName = useUserStore((state) => state.displayName)
  const avatarSeed = useUserStore((state) => state.avatarSeed)

  const [editing, setEditing] = useState(false)

  const stats = computeProfileStats(
    hydrated,
    matchPredictions,
    r32Matchups,
    thirdPlaceRanking,
    displayName,
    avatarSeed,
  )

  const shownName = displayName.trim() || "You"

  return (
    <div className="space-y-8 print-profile">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <img
            src={getDiceBearAvatarUrl(avatarSeed)}
            alt={`${shownName} avatar`}
            className="h-24 w-24 shrink-0 rounded-full bg-surface-2"
            width={96}
            height={96}
          />

          <div className="min-w-0 flex-1">
            {!editing ? (
              <div className="flex items-center gap-2">
                <h1 className="truncate text-2xl font-bold tracking-tight">
                  {shownName}
                </h1>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-md",
                    "text-text-muted transition-colors hover:bg-surface-2 hover:text-foreground",
                    "print:hidden",
                  )}
                  aria-label="Edit display name"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <ProfileNameForm
                defaultName={displayName}
                onCancel={() => setEditing(false)}
                onSaved={() => setEditing(false)}
              />
            )}

            <p className="mt-1 text-sm text-text-muted">Your prediction profile</p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="print:hidden"
          onClick={() => window.print()}
        >
          Print
        </Button>
      </header>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="mb-4 text-lg font-semibold">
          Stats
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatCard
            label="Group Predictions"
            value={
              stats
                ? `${Math.min(stats.groupCompleted, GROUP_MATCH_COUNT)} / ${GROUP_MATCH_COUNT}`
                : `— / ${GROUP_MATCH_COUNT}`
            }
            skeleton={!hydrated}
          />
          <StatCard
            label="R32 Matchups"
            value={stats ? `${stats.r32Ready} / 16` : "— / 16"}
            skeleton={!hydrated}
          />
          <StatCard
            label="Best 3rd Qualified"
            value={stats ? `${stats.qualifiedThirds} / 8` : "— / 8"}
            skeleton={!hydrated}
          />
          <StatCard
            label="Your Score"
            value={stats ? String(stats.score) : "—"}
            skeleton={!hydrated}
          />
          <StatCard
            label="Rank"
            value={stats ? `#${stats.rank}` : "—"}
            skeleton={!hydrated}
          />
        </div>
      </section>

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="mb-4 text-lg font-semibold">
          Prediction Summary
        </h2>
        <PredictionSummary
          matchPredictions={matchPredictions}
          hydrated={hydrated}
        />
      </section>
    </div>
  )
}
