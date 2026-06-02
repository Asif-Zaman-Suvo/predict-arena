"use client"

import { useState } from "react"
import { AuthModal } from "@/src/components/auth/AuthModal"
import { useAuth } from "@/src/contexts/AuthContext"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"

export function AuthHeaderButton() {
  const { user, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  if (loading) return null

  if (user) {
    return (
      <button
        type="button"
        onClick={() => void signOut()}
        className={cn(
          "hidden rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-text-muted sm:inline-flex",
          "transition-colors hover:text-foreground",
        )}
      >
        Sign out
      </button>
    )
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="hidden sm:inline-flex"
        onClick={() => setOpen(true)}
      >
        Sign in
      </Button>
      <AuthModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
