import { MatchCardSkeleton } from "@/src/components/matches/MatchCardSkeleton"
import { PageSkeleton } from "@/src/components/ui/page-skeleton"

export function FixturesSkeleton() {
  return (
    <div className="space-y-6">
      <PageSkeleton lines={2} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
