"use client"

import { useActionState, useEffect } from "react"
import { updateDisplayNameAction } from "@/src/actions/user"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

interface ProfileNameFormProps {
  defaultName: string
  onCancel: () => void
  onSaved: () => void
}

export function ProfileNameForm({
  defaultName,
  onCancel,
  onSaved,
}: ProfileNameFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateDisplayNameAction,
    null,
  )

  useEffect(() => {
    if (state?.ok) onSaved()
  }, [state, onSaved])

  return (
    <form action={formAction} className="space-y-2 print:hidden">
      <Input
        name="displayName"
        defaultValue={defaultName}
        aria-label="Display name"
        aria-invalid={state?.ok === false}
        className="max-w-xs bg-surface-2"
        autoFocus
      />
      {state?.ok === false && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save"}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-text-muted transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
