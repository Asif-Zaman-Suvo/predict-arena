"use client"

import {
  BRACKET_MATCH_HEIGHT,
  getMatchCenterY,
  getRoundColumnHeight,
} from "@/src/lib/bracket"
import { cn } from "@/src/lib/utils"

/** Width of fork between two adjacent round columns (lines meet next column). */
export const BRACKET_CONNECTOR_WIDTH = 40

interface BracketConnectorProps {
  pairCount: number
  fromRoundIndex: number
  toRoundIndex?: number
  /** Override target Y (e.g. final match below third-place block). */
  targetCenterY?: number | ((pairIndex: number) => number)
  className?: string
}

export function BracketConnector({
  pairCount,
  fromRoundIndex,
  toRoundIndex,
  targetCenterY,
  className,
}: BracketConnectorProps) {
  const width = BRACKET_CONNECTOR_WIDTH
  const paths: string[] = []
  const targetYs: number[] = []

  for (let pair = 0; pair < pairCount; pair++) {
    const topY = getMatchCenterY(fromRoundIndex, pair * 2)
    const bottomY = getMatchCenterY(fromRoundIndex, pair * 2 + 1)
    const targetY =
      typeof targetCenterY === "function"
        ? targetCenterY(pair)
        : (targetCenterY ??
          getMatchCenterY(toRoundIndex ?? fromRoundIndex, pair))
    targetYs.push(targetY)
    const midX = width / 2

    paths.push(
      `M 0 ${topY} H ${midX} V ${targetY} H ${width}`,
      `M 0 ${bottomY} H ${midX} V ${targetY}`,
    )
  }

  const fromMatchCount = pairCount * 2
  const fromColumnHeight = getRoundColumnHeight(
    fromMatchCount,
    fromRoundIndex,
  )
  const maxTargetY = Math.max(...targetYs)
  const svgHeight = Math.max(
    fromColumnHeight,
    maxTargetY + BRACKET_MATCH_HEIGHT / 2,
  )

  return (
    <svg
      aria-hidden="true"
      className={cn("shrink-0 self-start", className)}
      width={width}
      height={svgHeight}
      viewBox={`0 0 ${width} ${svgHeight}`}
      fill="none"
    >
      {paths.map((path, index) => (
        <path
          key={index}
          d={path}
          stroke="var(--border)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
