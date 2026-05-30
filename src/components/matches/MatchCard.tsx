import type { Match, Team, Venue } from "@/src/types/tournament"
import type { MatchPrediction } from "@/src/types/predictions"
import { TeamFlag } from "@/src/components/teams/TeamFlag"
import { cn, formatDate, formatScore } from "@/src/lib/utils"

interface MatchCardProps {
  match: Match
  homeTeam: Team
  awayTeam: Team
  venue: Venue
  prediction?: MatchPrediction | null
  className?: string
}

export function MatchCard({
  match,
  homeTeam,
  awayTeam,
  venue,
  prediction,
  className,
}: MatchCardProps) {
  return (
    <article
      className={cn(
        "relative rounded-lg border border-border bg-surface p-4",
        className,
      )}
    >
      <div className="absolute right-4 top-4">
        {prediction ? (
          <span className="text-sm font-semibold text-gold">
            {formatScore(prediction.homeScore, prediction.awayScore)}
          </span>
        ) : (
          <span className="text-sm text-text-muted" aria-label="No prediction">
            —
          </span>
        )}
      </div>

      <div className="space-y-3 pr-16">
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

      <p className="mt-3 text-xs text-text-muted">
        {formatDate(match.date)} · {venue.name}
      </p>
    </article>
  )
}
