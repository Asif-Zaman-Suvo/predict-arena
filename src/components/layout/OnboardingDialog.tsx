"use client"

import { useActionState, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { completeOnboardingAction } from "@/src/actions/user"
import { useUserStore } from "@/src/stores/user.store"
import { useHydrated } from "@/src/stores/hydration"

export function OnboardingDialog() {
  const hydrated = useHydrated()
  const hasOnboarded = useUserStore((s) => s.hasOnboarded)
  const [dismissed, setDismissed] = useState(false)
  const [name, setName] = useState("")
  const [state, formAction, isPending] = useActionState(
    completeOnboardingAction,
    null,
  )

  const open = hydrated && !hasOnboarded && !dismissed

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setDismissed(true)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-border bg-surface sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to the Arena</DialogTitle>
          <DialogDescription>
            Enter your display name to join the FIFA World Cup 2026 prediction
            league.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="display-name" className="text-sm font-medium">
              Display name
            </label>
            <Input
              id="display-name"
              name="displayName"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="nickname"
              autoFocus={open}
              aria-label="Display name"
              aria-invalid={state?.ok === false}
              className="bg-surface-2"
            />
            {state?.ok === false && (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!name.trim() || isPending}>
              {isPending ? "Saving…" : "Let's go"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
