"use client"

import type { Match, Team, Venue } from "@/src/types/tournament"
import { TeamFlag } from "@/src/components/teams/TeamFlag"
import { ScoreInput } from "@/src/components/predictions/ScoreInput"
import { useOptimisticMatchPrediction } from "@/src/components/providers/PredictionsOptimisticProvider"
import { cn, formatDate } from "@/src/lib/utils"

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

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-surface p-4",
        hasPrediction &&
          prediction &&
          (prediction.homeScore !== 0 || prediction.awayScore !== 0) &&
          "border-gold/30",
        className,
      )}
      aria-busy={isPending}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TeamFlag
            emoji={homeTeam.flagEmoji}
            name={homeTeam.name}
            size="sm"
          />
          <span className="truncate text-sm font-medium">{homeTeam.name}</span>
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
          vs
        </p>

        <div className="flex items-center gap-2">
          <TeamFlag
            emoji={awayTeam.flagEmoji}
            name={awayTeam.name}
            size="sm"
          />
          <span className="truncate text-sm font-medium">{awayTeam.name}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <ScoreInput
          homeTeamName={homeTeam.name}
          awayTeamName={awayTeam.name}
          homeScore={displayHome}
          awayScore={displayAway}
          onChange={submitScore}
          pending={isPending}
        />
      </div>

      <p className="mt-3 text-xs text-text-muted">
        {formatDate(match.date)} · {venue.name}
      </p>
    </article>
  )
}
