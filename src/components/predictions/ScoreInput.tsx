"use client"

import { useEffect, useState } from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/src/lib/utils"

interface ScoreInputProps {
  homeTeamName: string
  awayTeamName: string
  homeScore: number | null
  awayScore: number | null
  onCommit: (homeScore: number, awayScore: number) => void
  onClear?: () => void
  pending?: boolean
  className?: string
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(99, value))
}

function parseInputValue(raw: string): number | null {
  if (raw === "") return null
  const n = Number.parseInt(raw, 10)
  if (Number.isNaN(n)) return null
  return clampScore(n)
}

function ScoreField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (next: number | null) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
        onClick={() => {
          if (value === null) onChange(0)
          else onChange(clampScore(value - 1))
        }}
        disabled={value === null}
        aria-label={`Decrease ${label}`}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={2}
        value={value === null ? "" : String(value)}
        onChange={(event) => onChange(parseInputValue(event.target.value))}
        aria-label={label}
        className="h-11 w-12 rounded-md border border-border bg-surface-2 text-center text-sm font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        onClick={() => onChange(value === null ? 0 : clampScore(value + 1))}
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
  onCommit,
  onClear,
  pending = false,
  className,
}: ScoreInputProps) {
  const [draftHome, setDraftHome] = useState<number | null>(homeScore)
  const [draftAway, setDraftAway] = useState<number | null>(awayScore)

  useEffect(() => {
    setDraftHome(homeScore)
    setDraftAway(awayScore)
  }, [homeScore, awayScore])

  function applyDraft(nextHome: number | null, nextAway: number | null) {
    setDraftHome(nextHome)
    setDraftAway(nextAway)

    if (nextHome !== null && nextAway !== null) {
      onCommit(nextHome, nextAway)
      return
    }

    if (nextHome === null && nextAway === null) {
      onClear?.()
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        pending && "opacity-70",
        className,
      )}
      role="group"
      aria-label={`Score for ${homeTeamName} vs ${awayTeamName}`}
      aria-busy={pending}
    >
      <ScoreField
        label={`Home score for ${homeTeamName} vs ${awayTeamName}`}
        value={draftHome}
        onChange={(next) => applyDraft(next, draftAway)}
      />
      <span className="text-sm font-medium text-text-muted">:</span>
      <ScoreField
        label={`Away score for ${homeTeamName} vs ${awayTeamName}`}
        value={draftAway}
        onChange={(next) => applyDraft(draftHome, next)}
      />
    </div>
  )
}
