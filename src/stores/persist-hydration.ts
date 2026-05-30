"use client"

import { useSyncExternalStore } from "react"
import { usePredictionsStore } from "./predictions.store"
import { useUserStore } from "./user.store"

function subscribeHydration(
  store: {
    persist: {
      onFinishHydration: (fn: () => void) => () => void
      hasHydrated: () => boolean
    }
  },
  onStoreChange: () => void,
) {
  return store.persist.onFinishHydration(onStoreChange)
}

function getHydrated(
  store: { persist: { hasHydrated: () => boolean } },
): boolean {
  return store.persist.hasHydrated()
}

function useStoreHydrated(
  store: {
    persist: {
      onFinishHydration: (fn: () => void) => () => void
      hasHydrated: () => boolean
    }
  },
): boolean {
  return useSyncExternalStore(
    (onChange) => subscribeHydration(store, onChange),
    () => getHydrated(store),
    () => false,
  )
}

/** True after Zustand persist has rehydrated from localStorage (React 19–safe). */
export function usePersistHydrated(): boolean {
  const predictionsHydrated = useStoreHydrated(usePredictionsStore)
  const userHydrated = useStoreHydrated(useUserStore)
  return predictionsHydrated && userHydrated
}
