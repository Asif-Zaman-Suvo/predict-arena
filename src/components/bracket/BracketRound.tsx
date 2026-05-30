"use client"

import { cn } from "@/src/lib/utils"
import { getRoundGap } from "@/src/lib/bracket"
import { BracketMatch, type BracketMatchProps } from "./BracketMatch"

export interface BracketRoundProps {
  label: string
  roundIndex: number
  matches: Omit<BracketMatchProps, "roundLabel" | "matchIndex">[]
  skeleton?: boolean
}

export function BracketRound({
  label,
  roundIndex,
  matches,
  skeleton = false,
}: BracketRoundProps) {
  const gap = getRoundGap(roundIndex)

  return (
    <section
      aria-label={label}
      className="flex shrink-0 flex-col"
      style={{ gap: `${gap}px` }}
    >
      <h3 className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </h3>
      {matches.map((match, index) => (
        <BracketMatch
          key={match.matchId}
          {...match}
          roundLabel={label}
          matchIndex={index}
          skeleton={skeleton}
        />
      ))}
    </section>
  )
}
