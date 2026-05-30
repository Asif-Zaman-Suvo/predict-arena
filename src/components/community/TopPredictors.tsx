import Link from "next/link"
import type { LeaderboardEntry } from "@/src/types/leaderboard"
import { getDiceBearAvatarUrl } from "@/src/lib/avatars"
import { cn } from "@/src/lib/utils"

interface TopPredictorsProps {
  entries: LeaderboardEntry[]
  skeleton?: boolean
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span role="img" aria-label="Gold medal">
        🥇
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span role="img" aria-label="Silver medal">
        🥈
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span role="img" aria-label="Bronze medal">
        🥉
      </span>
    )
  }

  return (
    <span className="text-xs font-semibold tabular-nums text-text-muted">
      #{rank}
    </span>
  )
}

export function TopPredictors({ entries, skeleton = false }: TopPredictorsProps) {
  if (skeleton) {
    return (
      <div
        className="space-y-3"
        aria-busy="true"
        aria-label="Loading top predictors"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-3 rounded-lg border border-border bg-surface p-3"
          >
            <div className="h-8 w-8 rounded-full bg-surface-2" />
            <div className="h-4 flex-1 rounded bg-surface-2" />
            <div className="h-4 w-12 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <section aria-labelledby="top-predictors-heading">
      <h2 id="top-predictors-heading" className="mb-4 text-lg font-semibold">
        Top Predictors
      </h2>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-border bg-surface p-3",
            )}
          >
            <div className="flex w-8 shrink-0 items-center justify-center">
              <RankBadge rank={entry.rank} />
            </div>
            <img
              src={getDiceBearAvatarUrl(entry.avatarSeed)}
              alt={`${entry.displayName} avatar`}
              className="h-9 w-9 rounded-full bg-surface-2"
              width={36}
              height={36}
            />
            <div className="min-w-0 flex-1 truncate font-medium">
              {entry.displayName}
            </div>
            <div className="shrink-0 font-semibold tabular-nums text-gold">
              {entry.totalPoints} pts
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/leaderboard"
        className="mt-4 inline-flex text-sm font-medium text-gold transition-colors hover:text-foreground"
      >
        View full leaderboard →
      </Link>
    </section>
  )
}
