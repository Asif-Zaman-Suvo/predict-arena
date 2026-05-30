"use client"

import { AnimatePresence, motion } from "framer-motion"
import type { Team } from "@/src/types/tournament"
import { TeamFlag } from "@/src/components/teams/TeamFlag"
import { useMotionDuration } from "@/src/lib/motion"
import { cn } from "@/src/lib/utils"

export interface BracketMatchProps {
  matchId: string
  roundLabel: string
  matchIndex: number
  homeTeam: Team | null
  awayTeam: Team | null
  winnerTeamId: string | null
  teamsById: Record<string, Team>
  isEditable?: boolean
  onSelectWinner?: (matchId: string, teamId: string) => void
  skeleton?: boolean
}

function TeamRow({
  team,
  isWinner,
  skeleton,
}: {
  team: Team | null
  isWinner: boolean
  skeleton?: boolean
}) {
  const duration = useMotionDuration(0.2)

  if (skeleton) {
    return (
      <div className="flex h-7 items-center gap-2 rounded bg-surface-2 px-2">
        <div className="h-4 w-4 rounded bg-surface" />
        <div className="h-3 flex-1 rounded bg-surface" />
      </div>
    )
  }

  const label = team?.name ?? "TBD"

  return (
    <div
      className={cn(
        "flex h-7 items-center gap-2 rounded border-l-2 px-2 text-sm",
        isWinner
          ? "border-l-gold bg-surface-2 font-medium"
          : "border-l-transparent",
      )}
    >
      {team ? (
        <TeamFlag emoji={team.flagEmoji} name={team.name} size="sm" />
      ) : (
        <span
          className="inline-block h-4 w-4 rounded bg-surface-2"
          aria-hidden="true"
        />
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 4 }}
          transition={{ duration }}
          className="min-w-0 truncate"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function SelectableTeamRow({
  team,
  isWinner,
  label,
  onSelect,
}: {
  team: Team
  isWinner: boolean
  label: string
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Pick ${team.name} to win ${label}`}
      aria-pressed={isWinner}
      className={cn(
        "flex h-7 w-full min-h-11 items-center gap-2 rounded border-l-2 px-2 text-left text-sm transition-colors",
        "hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isWinner
          ? "border-l-gold bg-surface-2 font-medium"
          : "border-l-transparent",
      )}
    >
      <TeamFlag emoji={team.flagEmoji} name={team.name} size="sm" />
      <span className="min-w-0 truncate">{team.name}</span>
    </button>
  )
}

export function BracketMatch({
  matchId,
  roundLabel,
  matchIndex,
  homeTeam,
  awayTeam,
  winnerTeamId,
  isEditable = false,
  onSelectWinner,
  skeleton = false,
}: BracketMatchProps) {
  const winnerTeam =
    winnerTeamId != null
      ? (homeTeam?.id === winnerTeamId
          ? homeTeam
          : awayTeam?.id === winnerTeamId
            ? awayTeam
            : null)
      : null

  const bothTbd = homeTeam === null && awayTeam === null
  const resolvedHome = bothTbd && winnerTeam ? winnerTeam : homeTeam
  const resolvedAway = bothTbd && winnerTeam ? null : awayTeam

  const homeName = resolvedHome?.name ?? "TBD"
  const awayName = resolvedAway?.name ?? "TBD"
  const ariaLabel = `${roundLabel} Match ${matchIndex + 1}: ${homeName} vs ${awayName}`

  const homeWinner =
    winnerTeamId !== null &&
    resolvedHome !== null &&
    winnerTeamId === resolvedHome.id
  const awayWinner =
    winnerTeamId !== null &&
    resolvedAway !== null &&
    winnerTeamId === resolvedAway.id

  const canPick =
    isEditable &&
    onSelectWinner &&
    resolvedHome &&
    resolvedAway &&
    !skeleton

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="w-44 shrink-0 rounded-lg border border-border bg-surface p-2"
    >
      <div className="space-y-1">
        {canPick && resolvedHome ? (
          <SelectableTeamRow
            team={resolvedHome}
            isWinner={homeWinner}
            label={ariaLabel}
            onSelect={() => onSelectWinner(matchId, resolvedHome.id)}
          />
        ) : (
          <TeamRow
            team={resolvedHome}
            isWinner={homeWinner}
            skeleton={skeleton}
          />
        )}
        {canPick && resolvedAway ? (
          <SelectableTeamRow
            team={resolvedAway}
            isWinner={awayWinner}
            label={ariaLabel}
            onSelect={() => onSelectWinner(matchId, resolvedAway.id)}
          />
        ) : (
          <TeamRow
            team={resolvedAway}
            isWinner={awayWinner}
            skeleton={skeleton}
          />
        )}
      </div>
    </div>
  )
}
