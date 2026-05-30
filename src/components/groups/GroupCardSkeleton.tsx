import { cn } from "@/src/lib/utils"

interface GroupCardSkeletonProps {
  className?: string
}

export function GroupCardSkeleton({ className }: GroupCardSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-border bg-surface p-4",
        className,
      )}
      aria-busy="true"
      aria-label="Loading group"
    >
      <div className="mb-4 h-7 w-24 rounded bg-surface-2" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-surface-2" />
            <div className="h-4 w-5 rounded bg-surface-2" />
            <div className="h-4 flex-1 rounded bg-surface-2" />
            <div className="h-4 w-10 rounded bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
