"use client"

import {
  BRACKET_3RD_FINAL_GAP,
  BRACKET_MATCH_HEIGHT,
  BRACKET_ROUND_LABEL_HEIGHT,
  getFinalMatchTopOffset,
  getRoundColumnHeight,
} from "@/src/lib/bracket"
import { BracketMatch, type BracketMatchProps } from "./BracketMatch"

interface BracketFinalColumnProps {
  semifinalRoundIndex: number
  finalRoundIndex: number
  thirdPlace: Omit<BracketMatchProps, "roundLabel" | "matchIndex"> | null
  finalMatch: Omit<BracketMatchProps, "roundLabel" | "matchIndex">
  skeleton?: boolean
}

export function BracketFinalColumn({
  semifinalRoundIndex,
  finalRoundIndex,
  thirdPlace,
  finalMatch,
  skeleton = false,
}: BracketFinalColumnProps) {
  const columnMinHeight =
    BRACKET_ROUND_LABEL_HEIGHT +
    getRoundColumnHeight(2, semifinalRoundIndex)
  const finalMatchTop = getFinalMatchTopOffset(finalRoundIndex)
  const thirdBlockHeight =
    BRACKET_ROUND_LABEL_HEIGHT + BRACKET_MATCH_HEIGHT

  return (
    <section
      aria-label="Third place and final"
      className="relative w-44 shrink-0"
      style={{ minHeight: columnMinHeight }}
    >
      {thirdPlace ? (
        <div
          className="absolute left-0 right-0"
          style={{
            top: Math.max(
              0,
              finalMatchTop -
                BRACKET_3RD_FINAL_GAP -
                thirdBlockHeight,
            ),
          }}
        >
          <h3 className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-text-muted">
            Third Place
          </h3>
          <BracketMatch
            {...thirdPlace}
            roundLabel="Third Place"
            matchIndex={0}
            skeleton={skeleton}
          />
        </div>
      ) : null}

      <div
        className="absolute left-0 right-0"
        style={{ top: finalMatchTop }}
      >
        <h3 className="absolute top-[-20px] left-0 right-0 text-center text-xs font-semibold uppercase tracking-wide text-text-muted">
          Final
        </h3>
        <BracketMatch
          {...finalMatch}
          roundLabel="Final"
          matchIndex={0}
          skeleton={skeleton}
        />
      </div>
    </section>
  )
}
