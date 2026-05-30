import type { Team } from "@/src/types/tournament"
import { cn } from "@/src/lib/utils"

interface CommunityPickBarProps {
  homeTeam: Team
  awayTeam: Team
  homePct: number
  drawPct: number
  awayPct: number
  className?: string
}

export function CommunityPickBar({
  homeTeam,
  awayTeam,
  homePct,
  drawPct,
  awayPct,
  className,
}: CommunityPickBarProps) {
  const label = `${homeTeam.name} ${homePct}% · Draw ${drawPct}% · ${awayTeam.name} ${awayPct}%`

  return (
    <article className={cn("space-y-2 rounded-lg border border-border bg-surface p-3", className)}>
      <div className="flex items-center gap-2">
        <span className="w-10 shrink-0 truncate text-xs font-medium sm:w-16 sm:text-sm">
          {homeTeam.shortName}
        </span>

        <div className="flex h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            role="img"
            className="h-full bg-info transition-all"
            style={{ width: `${homePct}%` }}
            aria-label={`Home team: ${homePct}%`}
          />
          <div
            role="img"
            className="h-full bg-text-muted transition-all"
            style={{ width: `${drawPct}%` }}
            aria-label={`Draw: ${drawPct}%`}
          />
          <div
            role="img"
            className="h-full bg-gold transition-all"
            style={{ width: `${awayPct}%` }}
            aria-label={`Away team: ${awayPct}%`}
          />
        </div>

        <span className="w-10 shrink-0 truncate text-right text-xs font-medium sm:w-16 sm:text-sm">
          {awayTeam.shortName}
        </span>
      </div>

      <p className="text-xs text-text-muted">{label}</p>
    </article>
  )
}
