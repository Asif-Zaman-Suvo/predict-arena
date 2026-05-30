import { Suspense } from "react"
import { FixturesDataGate } from "@/src/components/fixtures/FixturesDataGate"
import { FixturesSkeleton } from "@/src/components/fixtures/FixturesSkeleton"

export default function FixturesPage() {
  return (
    <Suspense fallback={<FixturesSkeleton />}>
      <FixturesDataGate />
    </Suspense>
  )
}
