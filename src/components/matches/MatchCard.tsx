import type { Match, Team, Venue } from "@/src/types/tournament"
import type { MatchPrediction } from "@/src/types/predictions"
import { TeamFlag } from "@/src/components/teams/TeamFlag"
import {
  formatKickoffTime,
  formatMatchMeta,
} from "@/src/lib/match-display"
import { cn, formatScore } from "@/src/lib/utils"

interface OfficialResult {
  homeScore: number
  awayScore: number
}

interface MatchCardProps {
  match: Match
  homeTeam: Team
  awayTeam: Team
  venue: Venue
  prediction?: MatchPrediction | null
  officialResult?: OfficialResult | null
  className?: string
}

export function MatchCard({
  match,
  homeTeam,
  awayTeam,
  venue,
  prediction,
  officialResult,
  className,
}: MatchCardProps) {
  const kickoff = formatKickoffTime(match.date, venue.timezone)
  const isFinished = officialResult != null

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-surface px-4 py-5",
        className,
      )}
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

        <div className="flex shrink-0 flex-col items-center px-1">
          {isFinished ? (
            <>
              <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                FT
              </span>
              <span className="mt-0.5 text-xl font-bold tabular-nums tracking-tight text-gold">
                {officialResult.homeScore} – {officialResult.awayScore}
              </span>
            </>
          ) : (
            <>
              <time
                dateTime={match.date}
                className="text-xl font-bold tabular-nums tracking-tight"
              >
                {kickoff}
              </time>
              {prediction ? (
                <span className="mt-0.5 text-sm font-semibold text-gold">
                  {formatScore(prediction.homeScore, prediction.awayScore)}
                </span>
              ) : (
                <span
                  className="mt-0.5 text-sm text-text-muted"
                  aria-label="No prediction"
                >
                  —
                </span>
              )}
            </>
          )}
        </div>

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
    </article>
  )
}
