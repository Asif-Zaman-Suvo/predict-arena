import Link from "next/link"
import type { Standing, Team } from "@/src/types/tournament"
import { TeamFlag } from "@/src/components/teams/TeamFlag"
import { AdvancementIndicator } from "@/src/components/groups/AdvancementIndicator"
import { cn } from "@/src/lib/utils"

interface GroupCardProps {
  groupId: string
  groupName: string
  standings: Standing[]
  teamsById: Record<string, Team>
  standingsReady?: boolean
  className?: string
}

export function GroupCard({
  groupId,
  groupName,
  standings,
  teamsById,
  standingsReady = false,
  className,
}: GroupCardProps) {
  return (
    <Link
      href={`/groups/${groupId}`}
      className={cn(
        "block rounded-lg border border-border bg-surface p-4 transition-colors",
        "hover:border-gold/40 hover:bg-surface-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <h2 className="mb-4 text-2xl font-bold text-gold">{groupName}</h2>

      <ul className="space-y-3">
        {standings.map((standing, index) => {
          const team = teamsById[standing.teamId]
          if (!team) return null

          const isTopTwo = index < 2
          const showMaybe =
            index === 2 && standing.advancementStatus === "maybe"
          const showThirdAdvances =
            index === 2 && standing.advancementStatus === "advances"

          return (
            <li key={standing.teamId} className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 shrink-0 text-xs tabular-nums text-text-muted">
                  {index + 1}
                </span>
                <TeamFlag
                  emoji={team.flagEmoji}
                  name={team.name}
                  size="sm"
                />
                <span className="min-w-0 flex-1 truncate">{team.name}</span>
                <span className="shrink-0 tabular-nums text-text-muted">
                  {standingsReady ? `${standing.points} pts` : "—"}
                </span>
              </div>

              {standingsReady && isTopTwo && (
                <AdvancementIndicator status="advances" />
              )}
              {standingsReady && showMaybe && (
                <AdvancementIndicator status="maybe" />
              )}
              {standingsReady && showThirdAdvances && (
                <AdvancementIndicator status="advances" />
              )}
              {standingsReady &&
                index === 3 &&
                standing.advancementStatus === "eliminated" && (
                  <AdvancementIndicator status="eliminated" />
                )}
            </li>
          )
        })}
      </ul>

      {!standingsReady && (
        <p className="mt-3 text-xs text-text-muted">
          Predict all 6 group matches in Fixtures to see standings.
        </p>
      )}
    </Link>
  )
}
