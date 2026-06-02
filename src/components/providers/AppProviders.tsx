"use client"

import type { ReactNode } from "react"
import { OnboardingGate } from "@/src/components/layout/OnboardingGate"
import { PredictionsOptimisticProvider } from "./PredictionsOptimisticProvider"
import { PredictionsSyncProvider } from "./PredictionsSyncProvider"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PredictionsSyncProvider>
      <PredictionsOptimisticProvider>
        <OnboardingGate>{children}</OnboardingGate>
      </PredictionsOptimisticProvider>
    </PredictionsSyncProvider>
  )
}
