import { cn } from "@/src/lib/utils"

interface MatchCardSkeletonProps {
  className?: string
}

export function MatchCardSkeleton({ className }: MatchCardSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg border border-border bg-surface p-4",
        className,
      )}
      aria-busy="true"
      aria-label="Loading match"
    >
      <div className="mb-3 h-4 w-12 rounded bg-surface-2" />
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-surface-2" />
        <div className="h-3 w-8 rounded bg-surface-2" />
        <div className="h-4 w-2/3 rounded bg-surface-2" />
      </div>
      <div className="mt-3 h-3 w-1/2 rounded bg-surface-2" />
    </div>
  )
}
