import { Suspense } from "react"
import { LeaderboardDataGate } from "@/src/components/leaderboard/LeaderboardDataGate"
import { PageSkeleton } from "@/src/components/ui/page-skeleton"

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<PageSkeleton lines={8} />}>
      <LeaderboardDataGate />
    </Suspense>
  )
}
