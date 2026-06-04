"use client"

import { Fragment } from "react"
import {
  BRACKET_MAIN_ROUNDS,
  BRACKET_ROUND_LABEL_HEIGHT,
  getMatchCenterY,
  resolveBracket,
} from "@/src/lib/bracket"
import { buildTeamMap } from "@/src/lib/teams"
import { teams } from "@/src/data"
import { cn } from "@/src/lib/utils"
import { BracketConnector } from "./BracketConnector"
import { BracketFinalColumn } from "./BracketFinalColumn"
import { BracketRound } from "./BracketRound"

const teamsById = buildTeamMap(teams)

interface KnockoutBracketProps {
  knockoutPredictions: Record<string, string | null>
  r32Matchups: Record<
    string,
    { homeTeamId: string | null; awayTeamId: string | null }
  >
  isEditable?: boolean
  onSelectWinner?: (matchId: string, teamId: string) => void
  skeleton?: boolean
}

function toMatchProps(
  match: ReturnType<typeof resolveBracket>["r32"][0],
  isEditable: boolean,
  onSelectWinner: ((matchId: string, teamId: string) => void) | undefined,
  skeleton: boolean,
) {
  return {
    matchId: match.id,
    homeTeam: match.homeTeamId
      ? (teamsById[match.homeTeamId] ?? null)
      : null,
    awayTeam: match.awayTeamId
      ? (teamsById[match.awayTeamId] ?? null)
      : null,
    winnerTeamId: match.winnerTeamId,
    teamsById,
    isEditable,
    onSelectWinner,
    skeleton,
  }
}

export function KnockoutBracket({
  knockoutPredictions,
  r32Matchups,
  isEditable = false,
  onSelectWinner,
  skeleton = false,
}: KnockoutBracketProps) {
  const resolved = resolveBracket(knockoutPredictions, r32Matchups)

  const rounds = BRACKET_MAIN_ROUNDS.map((round, roundIndex) => ({
    ...round,
    roundIndex,
    matches: resolved[round.stage].map((m) =>
      toMatchProps(m, isEditable, onSelectWinner, skeleton),
    ),
  }))

  const thirdPlaceMatch = resolved["3rd"][0]
    ? toMatchProps(
        resolved["3rd"][0],
        isEditable,
        onSelectWinner,
        skeleton,
      )
    : null

  return (
    <div className="relative">
      <p
        id="bracket-scroll-hint"
        className="mb-2 text-xs text-text-muted lg:hidden print:hidden"
      >
        Scroll horizontally to view the full bracket →
      </p>
      <div
        className={cn(
          "overflow-x-auto pb-2 lg:overflow-visible",
          "print:overflow-visible",
        )}
        aria-describedby="bracket-scroll-hint"
      >
        {/* Flat row: round → connector → round → … so lines touch the next column */}
        <div className="flex min-w-max items-start px-1">
          {rounds.map((round, index) => {
            const nextRound = rounds[index + 1]
            const pairCount = nextRound
              ? Math.floor(round.matches.length / 2)
              : 0
            const connectsToFinal = nextRound?.stage === "final"

            if (round.stage === "final") {
              const sfRound = rounds.find((r) => r.stage === "sf")
              return (
                <BracketFinalColumn
                  key={round.stage}
                  semifinalRoundIndex={sfRound?.roundIndex ?? 3}
                  finalRoundIndex={round.roundIndex}
                  thirdPlace={thirdPlaceMatch}
                  finalMatch={round.matches[0]}
                  skeleton={skeleton}
                />
              )
            }

            return (
              <Fragment key={round.stage}>
                <BracketRound
                  label={round.label}
                  roundIndex={round.roundIndex}
                  matches={round.matches}
                  skeleton={skeleton}
                />
                {nextRound && pairCount > 0 ? (
                  <div
                    className="shrink-0 self-start"
                    style={{ marginTop: BRACKET_ROUND_LABEL_HEIGHT }}
                  >
                    <BracketConnector
                      pairCount={pairCount}
                      fromRoundIndex={round.roundIndex}
                      toRoundIndex={
                        connectsToFinal ? undefined : nextRound.roundIndex
                      }
                      targetCenterY={
                        connectsToFinal
                          ? getMatchCenterY(nextRound.roundIndex, 0)
                          : undefined
                      }
                    />
                  </div>
                ) : null}
              </Fragment>
            )
          })}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-pitch to-transparent lg:hidden print:hidden"
      />
    </div>
  )
}
