import { PageSkeleton } from "@/src/components/ui/page-skeleton"

export function BracketsSkeleton() {
  return (
    <div className="space-y-6">
      <PageSkeleton lines={2} />
      <div className="h-64 animate-pulse rounded-lg bg-surface-2" />
    </div>
  )
}
