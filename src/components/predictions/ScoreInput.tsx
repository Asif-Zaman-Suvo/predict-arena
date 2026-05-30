"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/src/lib/utils"

interface ScoreInputProps {
  homeTeamName: string
  awayTeamName: string
  homeScore: number | null
  awayScore: number | null
  onChange: (homeScore: number, awayScore: number) => void
  pending?: boolean
  className?: string
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(99, value))
}

function ScoreField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (next: number) => void
}) {
  const display = value ?? 0

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        onClick={() => onChange(clampScore(display - 1))}
        aria-label={`Decrease ${label}`}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <input
        type="number"
        min={0}
        max={99}
        value={display}
        onChange={(event) =>
          onChange(clampScore(Number.parseInt(event.target.value, 10) || 0))
        }
        aria-label={label}
        className="h-11 w-12 rounded-md border border-border bg-surface-2 text-center text-sm font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        onClick={() => onChange(clampScore(display + 1))}
        aria-label={`Increase ${label}`}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ScoreInput({
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  onChange,
  pending = false,
  className,
}: ScoreInputProps) {
  const home = homeScore ?? 0
  const away = awayScore ?? 0

  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2",
        pending && "opacity-70",
        className,
      )}
      role="group"
      aria-label={`Score for ${homeTeamName} vs ${awayTeamName}`}
      aria-busy={pending}
    >
      <ScoreField
        label={`Home score for ${homeTeamName} vs ${awayTeamName}`}
        value={homeScore}
        onChange={(next) => onChange(next, away)}
      />
      <span className="text-sm font-medium text-text-muted">:</span>
      <ScoreField
        label={`Away score for ${homeTeamName} vs ${awayTeamName}`}
        value={awayScore}
        onChange={(next) => onChange(home, next)}
      />
    </div>
  )
}
