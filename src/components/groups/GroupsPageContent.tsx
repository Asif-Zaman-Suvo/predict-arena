"use client"

import Link from "next/link"
import type { GroupsBundle } from "@/src/data/loaders"
import { useTournamentDerived } from "@/src/stores/tournament.selectors"
import { useHydrated } from "@/src/stores/hydration"
import { GroupGrid } from "@/src/components/groups/GroupGrid"
import { GroupCardSkeleton } from "@/src/components/groups/GroupCardSkeleton"
import { Button } from "@/src/components/ui/button"

interface GroupsPageContentProps {
  bundle: GroupsBundle
}

export function GroupsPageContent({ bundle }: GroupsPageContentProps) {
  const hydrated = useHydrated()
  const { groupStandings, groupComplete } = useTournamentDerived()
  const { groups, teamsById } = bundle

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
          <p className="mt-1 text-sm text-text-muted">
            Standings are calculated automatically from your fixture predictions.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/fixtures">Predict fixtures</Link>
        </Button>
      </header>

      {!hydrated ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          aria-busy="true"
          aria-label="Loading groups"
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <GroupCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <GroupGrid
          groups={groups}
          standings={groupStandings}
          groupComplete={groupComplete}
          teamsById={teamsById}
        />
      )}
    </div>
  )
}
