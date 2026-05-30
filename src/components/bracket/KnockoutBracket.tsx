"use client"

import {
  BRACKET_ROUNDS,
  getRoundGap,
  resolveBracket,
} from "@/src/lib/bracket"
import { r32MatchupsToRecord } from "@/src/lib/r32-slots"
import { buildTeamMap } from "@/src/lib/teams"
import { teams } from "@/src/data"
import { cn } from "@/src/lib/utils"
import { BracketConnector } from "./BracketConnector"
import { BracketRound } from "./BracketRound"

const teamsById = buildTeamMap(teams)
const ROUND_HEADER_OFFSET = 36

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

function SingleMatchConnector({
  fromGap,
  className,
}: {
  fromGap: number
  className?: string
}) {
  const width = 32
  const y = 56 / 2

  return (
    <svg
      aria-hidden="true"
      className={cn("shrink-0 self-start", className)}
      width={width}
      height={56}
      viewBox={`0 0 ${width} 56`}
      fill="none"
    >
      <path
        d={`M 0 ${y} H ${width}`}
        stroke="var(--border)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function KnockoutBracket({
  knockoutPredictions,
  r32Matchups,
  isEditable = false,
  onSelectWinner,
  skeleton = false,
}: KnockoutBracketProps) {
  const resolved = resolveBracket(knockoutPredictions, r32Matchups)

  const rounds = BRACKET_ROUNDS.map((round, roundIndex) => ({
    ...round,
    roundIndex,
    matches: resolved[round.stage].map((match) => ({
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
    })),
  }))

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
        <div
          className={cn(
            "flex min-w-max items-start gap-1 px-1",
            "lg:min-w-0 lg:w-full lg:justify-between",
            "print:min-w-0 print:w-full print:justify-between",
          )}
        >
          {rounds.map((round, index) => {
            const nextRound = rounds[index + 1]
            const pairCount = nextRound
              ? Math.floor(round.matches.length / 2)
              : 0
            const isSingleFeed =
              nextRound?.matches.length === 1 &&
              round.matches.length === 1

            return (
              <div key={round.stage} className="flex items-start">
                <BracketRound
                  label={round.label}
                  roundIndex={round.roundIndex}
                  matches={round.matches}
                  skeleton={skeleton}
                />
                {nextRound && (
                  <div
                    className="mx-1 shrink-0"
                    style={{ marginTop: ROUND_HEADER_OFFSET }}
                  >
                    {isSingleFeed ? (
                      <SingleMatchConnector
                        fromGap={getRoundGap(round.roundIndex)}
                      />
                    ) : pairCount > 0 ? (
                      <BracketConnector
                        pairCount={pairCount}
                        fromGap={getRoundGap(round.roundIndex)}
                        toGap={getRoundGap(nextRound.roundIndex)}
                      />
                    ) : null}
                  </div>
                )}
              </div>
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
