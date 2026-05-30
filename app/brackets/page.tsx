import { Suspense } from "react"
import { BracketsDataGate } from "@/src/components/bracket/BracketsDataGate"
import { BracketsSkeleton } from "@/src/components/bracket/BracketsSkeleton"

export default function BracketsPage() {
  return (
    <Suspense fallback={<BracketsSkeleton />}>
      <BracketsDataGate />
    </Suspense>
  )
}
