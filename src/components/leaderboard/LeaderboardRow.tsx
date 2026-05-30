"use client"

import { forwardRef, useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import type { RankedLeaderboardEntry } from "@/src/lib/leaderboard"
import { getDiceBearAvatarUrl } from "@/src/lib/avatars"
import { useMotionDelay, useMotionDuration } from "@/src/lib/motion"
import { cn } from "@/src/lib/utils"

interface LeaderboardRowProps {
  entry: RankedLeaderboardEntry
  index: number
}

function RankDisplay({ rank }: { rank: number }) {
  const medal =
    rank === 1 ? (
      <span role="img" aria-label="Gold medal">
        🥇
      </span>
    ) : rank === 2 ? (
      <span role="img" aria-label="Silver medal">
        🥈
      </span>
    ) : rank === 3 ? (
      <span role="img" aria-label="Bronze medal">
        🥉
      </span>
    ) : null

  return (
    <span className="inline-flex items-center gap-1.5 tabular-nums">
      {medal}
      <span>{rank}</span>
    </span>
  )
}

export const LeaderboardRow = forwardRef<HTMLTableRowElement, LeaderboardRowProps>(
  function LeaderboardRow({ entry, index }, ref) {
    const [expanded, setExpanded] = useState(false)
    const duration = useMotionDuration(0.25)
    const delay = useMotionDelay(index * 0.05)

    return (
      <>
        <motion.tr
          ref={ref}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay, duration }}
          className={cn(
            "border-b border-border",
            entry.isCurrentUser &&
              "border-l-2 border-l-gold bg-gold/5",
          )}
        >
          <td className="px-3 py-3 font-medium">
            <RankDisplay rank={entry.rank} />
          </td>
          <td className="px-3 py-3">
            <img
              src={getDiceBearAvatarUrl(entry.avatarSeed)}
              alt={`${entry.displayName} avatar`}
              className="h-8 w-8 rounded-full bg-surface-2"
              width={32}
              height={32}
            />
          </td>
          <td className="max-w-32 truncate px-3 py-3 font-medium sm:max-w-none">
            <span className="inline-flex items-center gap-2">
              {entry.displayName}
              {entry.isCurrentUser && (
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                  You
                </span>
              )}
            </span>
          </td>
          <td className="hidden px-3 py-3 text-center tabular-nums sm:table-cell">
            {entry.correctScores}
          </td>
          <td className="hidden px-3 py-3 text-center tabular-nums sm:table-cell">
            {entry.correctResults}
          </td>
          <td className="px-3 py-3 text-right font-semibold tabular-nums">
            <span className="hidden sm:inline">{entry.totalPoints}</span>
            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center justify-end gap-2 rounded-md sm:hidden"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-controls={`leaderboard-details-${entry.id}`}
              aria-label={`${entry.displayName}, ${entry.totalPoints} points. ${expanded ? "Collapse" : "Expand"} details`}
            >
              {entry.totalPoints}
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-text-muted transition-transform",
                  expanded && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
          </td>
        </motion.tr>

        {expanded && (
          <tr
            id={`leaderboard-details-${entry.id}`}
            className="border-b border-border bg-surface-2 sm:hidden"
          >
            <td colSpan={6} className="px-3 py-3 text-sm text-text-muted">
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide">Correct scores</dt>
                  <dd className="font-medium text-foreground">
                    {entry.correctScores}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide">Correct results</dt>
                  <dd className="font-medium text-foreground">
                    {entry.correctResults}
                  </dd>
                </div>
              </dl>
            </td>
          </tr>
        )}
      </>
    )
  },
)
