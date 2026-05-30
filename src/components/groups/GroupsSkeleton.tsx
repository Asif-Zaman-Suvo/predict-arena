import { GroupCardSkeleton } from "@/src/components/groups/GroupCardSkeleton"
import { PageSkeleton } from "@/src/components/ui/page-skeleton"

export function GroupsSkeleton() {
  return (
    <div className="space-y-6">
      <PageSkeleton lines={1} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <GroupCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
