import { cn } from "@/src/lib/utils"

interface GroupStandingsTableSkeletonProps {
  className?: string
}

export function GroupStandingsTableSkeleton({
  className,
}: GroupStandingsTableSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse overflow-hidden rounded-lg border border-border",
        className,
      )}
      aria-busy="true"
      aria-label="Loading standings"
    >
      <div className="border-b border-border bg-surface-2 px-3 py-3">
        <div className="h-4 w-full rounded bg-surface" />
      </div>
      <div className="space-y-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0"
          >
            <div className="h-4 w-4 rounded bg-surface-2" />
            <div className="h-4 w-5 rounded bg-surface-2" />
            <div className="h-4 flex-1 rounded bg-surface-2" />
            <div className="h-4 w-8 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
