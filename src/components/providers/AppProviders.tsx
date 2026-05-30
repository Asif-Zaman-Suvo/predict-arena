"use client"

import type { ReactNode } from "react"
import { OnboardingGate } from "@/src/components/layout/OnboardingGate"
import { PredictionsOptimisticProvider } from "./PredictionsOptimisticProvider"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PredictionsOptimisticProvider>
      <OnboardingGate>{children}</OnboardingGate>
    </PredictionsOptimisticProvider>
  )
}
