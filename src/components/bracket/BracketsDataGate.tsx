"use client"

import { BracketPageContent } from "./BracketPageContent"

/** Bracket data is derived from Zustand; gate allows Suspense boundary consistency. */
export function BracketsDataGate() {
  return <BracketPageContent />
}
