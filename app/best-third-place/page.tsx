import { Suspense } from "react"
import { BestThirdDataGate } from "@/src/components/best-third-place/BestThirdDataGate"
import { BestThirdSkeleton } from "@/src/components/best-third-place/BestThirdSkeleton"

export default function BestThirdPlacePage() {
  return (
    <Suspense fallback={<BestThirdSkeleton />}>
      <BestThirdDataGate />
    </Suspense>
  )
}
