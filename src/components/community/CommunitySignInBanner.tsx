"use client"

import { useState } from "react"
import { AuthModal } from "@/src/components/auth/AuthModal"
import { useAuth } from "@/src/contexts/AuthContext"
import { Button } from "@/src/components/ui/button"

export function CommunitySignInBanner() {
  const { user, loading } = useAuth()
  const [open, setOpen] = useState(false)

  if (loading || user) return null

  return (
    <>
      <div className="rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-foreground">
        <p>
          Sign in to save predictions to the database and appear in community
          picks and Who&apos;s Joined.
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-3"
          onClick={() => setOpen(true)}
        >
          Sign in or create account
        </Button>
      </div>
      <AuthModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
