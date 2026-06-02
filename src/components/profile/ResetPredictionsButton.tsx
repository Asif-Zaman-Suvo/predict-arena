"use client"

import { useState, useTransition } from "react"
import { resetAllPredictions } from "@/src/actions/predictions"
import { Button } from "@/src/components/ui/button"
import { useAuth } from "@/src/contexts/AuthContext"

export function ResetPredictionsButton() {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!user) return null

  function handleReset() {
    const confirmed = window.confirm(
      "Reset all predictions? This clears every group score and knockout pick. You can predict again from scratch.",
    )
    if (!confirmed) return

    setError(null)
    startTransition(async () => {
      const result = await resetAllPredictions()
      if (!result.ok) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="print:hidden border-destructive/40 text-destructive hover:bg-destructive/10"
        onClick={handleReset}
        disabled={isPending}
      >
        {isPending ? "Resetting…" : "Reset all predictions"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
