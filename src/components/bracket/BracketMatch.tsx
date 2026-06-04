"use client"

import { AnimatePresence, motion } from "framer-motion"
import type { Team } from "@/src/types/tournament"
import { TeamFlag } from "@/src/components/teams/TeamFlag"
import { useMotionDuration } from "@/src/lib/motion"
import { BRACKET_MATCH_HEIGHT, BRACKET_ROW_HEIGHT } from "@/src/lib/bracket"
import { cn } from "@/src/lib/utils"

const teamRowClass =
  "flex w-full items-center gap-2 rounded border-l-2 px-2 text-sm"

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
      <div
        className="flex items-center gap-2 rounded bg-surface-2 px-2"
        style={{ height: BRACKET_ROW_HEIGHT }}
      >
        <div className="h-4 w-4 rounded bg-surface" />
        <div className="h-3 flex-1 rounded bg-surface" />
      </div>
    )
  }

  const label = team?.name ?? "TBD"

  return (
    <div
      className={cn(
        teamRowClass,
        isWinner
          ? "border-l-gold bg-surface-2 font-medium"
          : "border-l-transparent",
      )}
      style={{ height: BRACKET_ROW_HEIGHT }}
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
        teamRowClass,
        "text-left transition-colors",
        "hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isWinner
          ? "border-l-gold bg-surface-2 font-medium"
          : "border-l-transparent",
      )}
      style={{ height: BRACKET_ROW_HEIGHT }}
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
      className="box-border flex w-44 shrink-0 flex-col rounded-lg border border-border bg-surface p-2"
      style={{ height: BRACKET_MATCH_HEIGHT }}
    >
      <div className="flex flex-col gap-1">
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
