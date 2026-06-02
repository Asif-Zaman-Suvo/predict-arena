"use client"

import { Trophy } from "lucide-react"
import Link from "next/link"
import { teams } from "@/src/data"
import { buildTeamMap } from "@/src/lib/teams"
import { r32MatchupsToRecord } from "@/src/lib/r32-slots"
import { GROUP_MATCH_COUNT } from "@/src/lib/tournament"
import { submitKnockoutPrediction } from "@/src/actions/knockout-predictions"
import { usePredictionsStore } from "@/src/stores/predictions.store"
import { useTournamentDerived } from "@/src/stores/tournament.selectors"
import { useUserStore } from "@/src/stores/user.store"
import { useHydrated } from "@/src/stores/hydration"
import { KnockoutBracket } from "@/src/components/bracket/KnockoutBracket"
import { TeamFlag } from "@/src/components/teams/TeamFlag"
import { Button } from "@/src/components/ui/button"

const teamsById = buildTeamMap(teams)

export function BracketPageContent() {
  const hydrated = useHydrated()
  const { r32Matchups, isGroupStageComplete: stageComplete } =
    useTournamentDerived()
  const knockoutPredictions = usePredictionsStore(
    (state) => state.knockoutPredictions,
  )
  const setKnockoutPrediction = usePredictionsStore(
    (state) => state.setKnockoutPrediction,
  )
  const displayName = useUserStore((state) => state.displayName)

  const r32Record = r32MatchupsToRecord(r32Matchups)

  const championId = hydrated ? knockoutPredictions["k-final-1"] : null
  const champion = championId ? (teamsById[championId] ?? null) : null

  const filledR32Slots = r32Matchups.filter(
    (m) => m.homeTeamId && m.awayTeamId,
  ).length

  function handleSelectWinner(matchId: string, teamId: string) {
    const current = knockoutPredictions[matchId]
    const next = current === teamId ? null : teamId
    setKnockoutPrediction(matchId, next)
    void submitKnockoutPrediction(matchId, next)
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knockout Bracket</h1>
          <p className="mt-1 text-sm text-text-muted">
            {hydrated && displayName ? displayName : "—"}
          </p>
          {!stageComplete ? (
            <p className="mt-2 text-sm text-text-muted">
              Predict all {GROUP_MATCH_COUNT} fixtures to unlock the Round of 32.{" "}
              <Link href="/fixtures" className="text-gold hover:underline">
                Go to fixtures
              </Link>
            </p>
          ) : (
            <p className="mt-2 text-sm text-text-muted">
              Round of 32 is derived from your fixture predictions. Click a team
              to pick knockout winners.{" "}
              <Link href="/fixtures" className="text-gold hover:underline">
                Edit fixtures
              </Link>
            </p>
          )}
          {hydrated && stageComplete && (
            <p className="mt-1 text-xs text-text-muted">
              {filledR32Slots} / 16 Round of 32 matchups determined
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          className="print:hidden"
          onClick={() => window.print()}
        >
          Print Bracket
        </Button>
      </header>

      <section aria-label="Knockout bracket" className="print-bracket">
        <KnockoutBracket
          knockoutPredictions={knockoutPredictions}
          r32Matchups={r32Record}
          isEditable={stageComplete}
          onSelectWinner={handleSelectWinner}
          skeleton={!hydrated}
        />
      </section>

      <section
        aria-labelledby="champion-heading"
        className="rounded-lg border border-border bg-surface p-6 print:mt-4"
      >
        <h2 id="champion-heading" className="mb-4 text-lg font-semibold">
          Predicted Champion
        </h2>
        {!hydrated ? (
          <div
            className="flex animate-pulse items-center gap-4"
            aria-busy="true"
            aria-label="Loading champion"
          >
            <div className="h-12 w-12 rounded-full bg-surface-2" />
            <div className="h-5 w-32 rounded bg-surface-2" />
          </div>
        ) : champion ? (
          <div className="flex items-center gap-4">
            <TeamFlag
              emoji={champion.flagEmoji}
              name={champion.name}
              size="lg"
            />
            <div>
              <p className="text-lg font-semibold">{champion.name}</p>
              <p className="flex items-center gap-1.5 text-sm text-gold">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                <span>Predicted winner</span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            {stageComplete
              ? "Pick winners through the bracket to predict a champion."
              : `Complete all ${GROUP_MATCH_COUNT} fixture predictions first.`}
          </p>
        )}
      </section>
    </div>
  )
}
