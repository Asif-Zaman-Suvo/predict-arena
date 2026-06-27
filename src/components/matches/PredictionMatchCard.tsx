"use client"

import type { Match, Team, Venue } from "@/src/types/tournament"
import { TeamFlag } from "@/src/components/teams/TeamFlag"
import { ScoreInput } from "@/src/components/predictions/ScoreInput"
import { useOptimisticMatchPrediction } from "@/src/components/providers/PredictionsOptimisticProvider"
import {
  formatKickoffTime,
  formatMatchMeta,
} from "@/src/lib/match-display"
import { cn } from "@/src/lib/utils"

interface OfficialResult {
  homeScore: number
  awayScore: number
}

interface PredictionMatchCardProps {
  match: Match
  homeTeam: Team
  awayTeam: Team
  venue: Venue
  officialResult?: OfficialResult | null
  className?: string
}

export function PredictionMatchCard({
  match,
  homeTeam,
  awayTeam,
  venue,
  officialResult,
  className,
}: PredictionMatchCardProps) {
  const {
    prediction,
    hasPrediction,
    displayHome,
    displayAway,
    submitScore,
    clearScore,
    isPending,
  } = useOptimisticMatchPrediction(match.id)

  const kickoff = formatKickoffTime(match.date, venue.timezone)
  const isFinished = officialResult != null

  // Points earned: compare user prediction against official result
  let points: number | null = null
  if (isFinished && prediction) {
    const oh = officialResult.homeScore
    const oa = officialResult.awayScore
    const ph = prediction.homeScore
    const pa = prediction.awayScore
    if (ph === oh && pa === oa) {
      points = 3
    } else if (
      (ph > pa && oh > oa) ||
      (ph < pa && oh < oa) ||
      (ph === pa && oh === oa)
    ) {
      points = 1
    } else {
      points = 0
    }
  }

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-surface px-4 py-5",
        !isFinished && hasPrediction && "border-gold/30",
        isFinished && "border-border/60",
        className,
      )}
      aria-busy={isPending}
    >
      <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-medium">
            {homeTeam.name}
          </span>
          <TeamFlag
            emoji={homeTeam.flagEmoji}
            name={homeTeam.name}
            size="sm"
          />
        </div>

        {isFinished ? (
          <div className="flex shrink-0 flex-col items-center gap-0.5 px-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              FT
            </span>
            <span className="text-2xl font-bold tabular-nums tracking-tight text-gold">
              {officialResult.homeScore} – {officialResult.awayScore}
            </span>
          </div>
        ) : (
          <time
            dateTime={match.date}
            className="shrink-0 px-1 text-xl font-bold tabular-nums tracking-tight"
          >
            {kickoff}
          </time>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <TeamFlag
            emoji={awayTeam.flagEmoji}
            name={awayTeam.name}
            size="sm"
          />
          <span className="truncate text-sm font-medium">{awayTeam.name}</span>
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-text-muted">
        {formatMatchMeta(match, venue)}
      </p>

      <div className="mt-4 border-t border-border pt-4">
        {isFinished ? (
          <div className="flex items-center justify-center gap-3">
            {prediction ? (
              <>
                <span className="text-xs text-text-muted">Your pick:</span>
                <span className="tabular-nums text-sm font-semibold text-text-secondary">
                  {prediction.homeScore} – {prediction.awayScore}
                </span>
                {points !== null && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-bold",
                      points === 3 && "bg-emerald-500/20 text-emerald-400",
                      points === 1 && "bg-gold/20 text-gold",
                      points === 0 && "bg-surface-2 text-text-muted",
                    )}
                  >
                    {points === 3 ? "+3 pts" : points === 1 ? "+1 pt" : "0 pts"}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-text-muted italic">No prediction</span>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <ScoreInput
              homeTeamName={homeTeam.name}
              awayTeamName={awayTeam.name}
              homeScore={displayHome}
              awayScore={displayAway}
              onCommit={submitScore}
              onClear={clearScore}
              pending={isPending}
              className="justify-center"
            />
          </div>
        )}
      </div>
    </article>
  )
}
