import type { Group, Standing, Team } from "@/src/types/tournament"
import { GroupCard } from "@/src/components/groups/GroupCard"
import { cn } from "@/src/lib/utils"

interface GroupGridProps {
  groups: Group[]
  standings: Record<string, Standing[]>
  groupComplete: Record<string, boolean>
  teamsById: Record<string, Team>
  className?: string
}

export function GroupGrid({
  groups,
  standings,
  groupComplete,
  teamsById,
  className,
}: GroupGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          groupId={group.id}
          groupName={group.name}
          standings={standings[group.id] ?? []}
          standingsReady={groupComplete[group.id] ?? false}
          teamsById={teamsById}
        />
      ))}
    </div>
  )
}
