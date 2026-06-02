"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAuth } from "@/src/contexts/AuthContext"
import { hydratePredictionsFromDatabase } from "@/src/lib/supabase/sync-predictions"
import { supabase } from "@/src/lib/supabase/client"
import { useHydrated } from "@/src/stores/hydration"
import { useUserStore } from "@/src/stores/user.store"

interface PredictionsSyncValue {
  syncing: boolean
  syncError: string | null
}

const PredictionsSyncContext = createContext<PredictionsSyncValue>({
  syncing: false,
  syncError: null,
})

export function PredictionsSyncProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const hydrated = useHydrated()
  const localDisplayName = useUserStore((s) => s.displayName)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !hydrated || !user) return

    let cancelled = false

    const userId = user.id

    async function sync() {
      setSyncing(true)
      setSyncError(null)

      try {
        if (localDisplayName.trim()) {
          await supabase
            .from("users")
            .update({ display_name: localDisplayName.trim() })
            .eq("id", userId)
        }

        await hydratePredictionsFromDatabase(userId)
      } catch (err) {
        if (!cancelled) {
          setSyncError(
            err instanceof Error ? err.message : "Failed to load predictions",
          )
        }
      } finally {
        if (!cancelled) setSyncing(false)
      }
    }

    void sync()

    return () => {
      cancelled = true
    }
  }, [user, authLoading, hydrated, localDisplayName])

  return (
    <PredictionsSyncContext.Provider value={{ syncing, syncError }}>
      {children}
    </PredictionsSyncContext.Provider>
  )
}

export function usePredictionsSync() {
  return useContext(PredictionsSyncContext)
}
