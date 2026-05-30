"use client"

import { cn } from "@/src/lib/utils"

const SLOT_HEIGHT = 56

interface BracketConnectorProps {
  pairCount: number
  fromGap: number
  toGap: number
  className?: string
}

function matchCenterY(index: number, gap: number): number {
  return index * (SLOT_HEIGHT + gap) + SLOT_HEIGHT / 2
}

export function BracketConnector({
  pairCount,
  fromGap,
  toGap,
  className,
}: BracketConnectorProps) {
  const width = 32
  const paths: string[] = []

  for (let pair = 0; pair < pairCount; pair++) {
    const topY = matchCenterY(pair * 2, fromGap)
    const bottomY = matchCenterY(pair * 2 + 1, fromGap)
    const targetY = matchCenterY(pair, toGap)
    const midX = width / 2

    paths.push(
      `M 0 ${topY} H ${midX} V ${targetY} H ${width}`,
      `M 0 ${bottomY} H ${midX} V ${targetY}`,
    )
  }

  const fromCount = pairCount * 2
  const svgHeight =
    fromCount * SLOT_HEIGHT + Math.max(0, fromCount - 1) * fromGap

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
