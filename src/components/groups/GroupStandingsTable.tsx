"use client"

import { LayoutGroup, motion } from "framer-motion"
import type { Standing, Team } from "@/src/types/tournament"
import { TeamFlag } from "@/src/components/teams/TeamFlag"
import {
  AdvancementIndicator,
  getRowBorderClass,
} from "@/src/components/groups/AdvancementIndicator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip"
import { useMotionDuration } from "@/src/lib/motion"
import { cn } from "@/src/lib/utils"
import { CheckCircle2, CircleDot, XCircle } from "lucide-react"
import type { AdvancementStatus } from "@/src/types/tournament"

interface GroupStandingsTableProps {
  standings: Standing[]
  teamsById: Record<string, Team>
  className?: string
}

const STATUS_ICONS = {
  advances: CheckCircle2,
  maybe: CircleDot,
  eliminated: XCircle,
  tbd: CircleDot,
} as const

const STATUS_LABELS: Record<AdvancementStatus, string> = {
  advances: "Advances",
  maybe: "Best 3rd place contender",
  eliminated: "Eliminated",
  tbd: "To be determined",
}

function getStatusLabel(standing: Standing, position: number): string {
  if (position === 3 && standing.advancementStatus === "advances") {
    return "Advances (best 3rd)"
  }
  if (position === 3 && standing.advancementStatus === "eliminated") {
    return "Eliminated (3rd)"
  }
  return STATUS_LABELS[standing.advancementStatus]
}

export function GroupStandingsTable({
  standings,
  teamsById,
  className,
}: GroupStandingsTableProps) {
  const rowDuration = useMotionDuration(0.3)

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "max-w-full overflow-x-auto rounded-lg border border-border",
          className,
        )}
      >
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
              <th className="px-3 py-2 font-medium">Pos</th>
              <th className="px-2 py-2 font-medium">
                <span className="sr-only">Flag</span>
              </th>
              <th className="px-3 py-2 font-medium">Team</th>
              <th className="px-2 py-2 text-center font-medium">P</th>
              <th className="px-2 py-2 text-center font-medium">W</th>
              <th className="px-2 py-2 text-center font-medium">D</th>
              <th className="px-2 py-2 text-center font-medium">L</th>
              <th className="px-2 py-2 text-center font-medium">GF</th>
              <th className="px-2 py-2 text-center font-medium">GA</th>
              <th className="px-2 py-2 text-center font-medium">GD</th>
              <th className="px-3 py-2 text-center font-medium">Pts</th>
              <th className="px-2 py-2 font-medium">
                <span className="sr-only">Status</span>
              </th>
            </tr>
          </thead>
          <LayoutGroup>
            <tbody>
              {standings.map((standing, index) => {
                const team = teamsById[standing.teamId]
                if (!team) return null

                const position = index + 1
                const borderClass = getRowBorderClass(
                  index,
                  standing.advancementStatus,
                )
                const StatusIcon = STATUS_ICONS[standing.advancementStatus]
                const statusLabel = getStatusLabel(standing, position)

                return (
                  <motion.tr
                    key={standing.teamId}
                    layout
                    layoutId={standing.teamId}
                    transition={{ duration: rowDuration, ease: "easeOut" }}
                    className={cn(
                      "border-b border-border bg-surface last:border-b-0",
                      "border-l-4",
                      borderClass,
                    )}
                  >
                  <td className="px-3 py-3 tabular-nums">{position}</td>
                  <td className="px-2 py-3">
                    <TeamFlag
                      emoji={team.flagEmoji}
                      name={team.name}
                      size="sm"
                    />
                  </td>
                  <td className="max-w-32 truncate px-3 py-3 font-medium sm:max-w-none">
                    {team.name}
                  </td>
                  <td className="px-2 py-3 text-center tabular-nums">
                    {standing.played}
                  </td>
                  <td className="px-2 py-3 text-center tabular-nums">
                    {standing.won}
                  </td>
                  <td className="px-2 py-3 text-center tabular-nums">
                    {standing.drawn}
                  </td>
                  <td className="px-2 py-3 text-center tabular-nums">
                    {standing.lost}
                  </td>
                  <td className="px-2 py-3 text-center tabular-nums">
                    {standing.goalsFor}
                  </td>
                  <td className="px-2 py-3 text-center tabular-nums">
                    {standing.goalsAgainst}
                  </td>
                  <td className="px-2 py-3 text-center tabular-nums">
                    {standing.goalDifference > 0
                      ? `+${standing.goalDifference}`
                      : standing.goalDifference}
                  </td>
                  <td className="px-3 py-3 text-center font-semibold tabular-nums">
                    {standing.points}
                  </td>
                    <td className="px-2 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-11 w-11 items-center justify-center gap-1 rounded-md text-text-muted hover:bg-surface-2 hover:text-foreground"
                            aria-label={statusLabel}
                          >
                            <StatusIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span className="sr-only">{statusLabel}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="bg-surface">
                          <AdvancementIndicator
                            status={standing.advancementStatus}
                          />
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </LayoutGroup>
        </table>
      </div>
    </TooltipProvider>
  )
}
