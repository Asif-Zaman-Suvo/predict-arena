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

interface PredictionMatchCardProps {
  match: Match
  homeTeam: Team
  awayTeam: Team
  venue: Venue
  className?: string
}

export function PredictionMatchCard({
  match,
  homeTeam,
  awayTeam,
  venue,
  className,
}: PredictionMatchCardProps) {
  const {
    prediction,
    hasPrediction,
    displayHome,
    displayAway,
    submitScore,
    isPending,
  } = useOptimisticMatchPrediction(match.id)

  const kickoff = formatKickoffTime(match.date, venue.timezone)

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-surface px-4 py-5",
        hasPrediction &&
          prediction &&
          (prediction.homeScore !== 0 || prediction.awayScore !== 0) &&
          "border-gold/30",
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

        <time
          dateTime={match.date}
          className="shrink-0 px-1 text-xl font-bold tabular-nums tracking-tight"
        >
          {kickoff}
        </time>

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

      <div className="mt-4 flex justify-center border-t border-border pt-4">
        <ScoreInput
          homeTeamName={homeTeam.name}
          awayTeamName={awayTeam.name}
          homeScore={displayHome}
          awayScore={displayAway}
          onChange={submitScore}
          pending={isPending}
          className="justify-center"
        />
      </div>
    </article>
  )
}
