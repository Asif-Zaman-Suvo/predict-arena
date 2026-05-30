import { cn } from "@/src/lib/utils"

export function PageSkeleton({
  className,
  lines = 6,
}: {
  className?: string
  lines?: number
}) {
  return (
    <div
      className={cn("space-y-4", className)}
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="h-8 w-48 animate-pulse rounded bg-surface-2" />
      <div className="h-4 w-full max-w-md animate-pulse rounded bg-surface-2" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-2" />
      ))}
    </div>
  )
}
