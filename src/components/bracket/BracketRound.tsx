"use client"

import { getFirstMatchMarginTop, getRoundGap } from "@/src/lib/bracket"
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
    <section aria-label={label} className="flex shrink-0 flex-col">
      <h3 className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </h3>
      <div className="flex flex-col" style={{ gap: `${gap}px` }}>
        {matches.map((match, index) => {
          const marginTop =
            index === 0 ? getFirstMatchMarginTop(roundIndex) : undefined

          return (
            <div
              key={match.matchId}
              style={marginTop ? { marginTop: `${marginTop}px` } : undefined}
            >
              <BracketMatch
                {...match}
                roundLabel={label}
                matchIndex={index}
                skeleton={skeleton}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
