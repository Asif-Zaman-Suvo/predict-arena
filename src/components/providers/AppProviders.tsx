"use client"

import type { ReactNode } from "react"
import { PredictionsOptimisticProvider } from "./PredictionsOptimisticProvider"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PredictionsOptimisticProvider>{children}</PredictionsOptimisticProvider>
  )
}
