"use client"

import { useState } from "react"
import { useAuth } from "@/src/contexts/AuthContext"
import { useUserStore } from "@/src/stores/user.store"
import { useHydrated } from "@/src/stores/hydration"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, isRateLimited } = useAuth()
  const hydrated = useHydrated()
  const localDisplayName = useUserStore((s) => s.displayName)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (isSignUp) {
        const name = (displayName || localDisplayName).trim()
        if (!name) {
          setError("Display name is required")
          setLoading(false)
          return
        }
        const { error, requiresAction } = await signUp(email, password, name)
        if (error) {
          setError(error)
        } else if (requiresAction) {
          setSuccess("Account created successfully!")
          setTimeout(() => onClose(), 1500)
        } else {
          onClose()
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error)
        } else {
          onClose()
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setDisplayName("")
    setError(null)
    setSuccess(null)
  }

  const toggleMode = () => {
    resetForm()
    setIsSignUp(!isSignUp)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Sign Up" : "Sign In"}</DialogTitle>
        </DialogHeader>

        {/* Success message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
            <p className="text-sm text-green-500">{success}</p>
          </div>
        )}

        {/* Rate limit warning */}
        {isRateLimited && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
            <p className="text-sm text-yellow-500">
              Too many authentication attempts. Please wait a few minutes before trying again.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {isSignUp && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName || (hydrated ? localDisplayName : "")}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                placeholder="Your display name"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || isRateLimited}
            className="w-full rounded-md bg-gold px-4 py-2 text-sm font-semibold text-surface-9 hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={toggleMode}
            className="w-full text-sm text-text-muted hover:text-foreground"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}