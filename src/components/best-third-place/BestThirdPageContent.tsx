"use client"

import { Fragment } from "react"
import Link from "next/link"
import type { GroupsBundle } from "@/src/data/loaders"
import { useTournamentDerived } from "@/src/stores/tournament.selectors"
import { useHydrated } from "@/src/stores/hydration"
import { TeamFlag } from "@/src/components/teams/TeamFlag"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"
import { CheckCircle2, XCircle } from "lucide-react"
import { PageSkeleton } from "@/src/components/ui/page-skeleton"

interface BestThirdPageContentProps {
  bundle: GroupsBundle
}

const R32_CUTOFF = 8

export function BestThirdPageContent({ bundle }: BestThirdPageContentProps) {
  const hydrated = useHydrated()
  const { bestThirdPlaceRanking, isGroupStageComplete } = useTournamentDerived()
  const { teamsById } = bundle

  const incomplete = hydrated && !isGroupStageComplete
  const loading = !hydrated

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Best Third-Place Teams</h1>
          <p className="mt-1 text-sm text-text-muted">
            All 12 third-placed teams ranked — top {R32_CUTOFF} advance to the Round of 32.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/groups">View Groups</Link>
        </Button>
      </header>

      {loading ? (
        <PageSkeleton lines={12} />
      ) : incomplete ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface-2 px-6 py-12 text-center">
          <p className="text-base font-medium text-text-muted">
            Complete all 72 group-stage predictions to see the third-place rankings.
          </p>
          <Button asChild>
            <Link href="/fixtures">Predict fixtures</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-3 py-2.5 font-medium">#</th>
                <th className="px-2 py-2.5 font-medium">
                  <span className="sr-only">Flag</span>
                </th>
                <th className="px-3 py-2.5 font-medium">Team</th>
                <th className="px-3 py-2.5 font-medium">Group</th>
                <th className="px-3 py-2.5 text-center font-medium">Pts</th>
                <th className="px-3 py-2.5 text-center font-medium">GD</th>
                <th className="px-3 py-2.5 text-center font-medium">GF</th>
                <th className="px-3 py-2.5 font-medium">
                  <span className="sr-only">Status</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {bestThirdPlaceRanking.map((entry, index) => {
                const team = teamsById[entry.teamId]
                if (!team) return null

                const isCutoff = index === R32_CUTOFF - 1
                const qualifies = entry.qualifies

                return (
                  <Fragment key={entry.teamId}>
                    <tr
                      className={cn(
                        "border-b border-border bg-surface transition-colors last:border-b-0",
                        "border-l-4",
                        qualifies ? "border-l-emerald-500" : "border-l-red-500/50",
                      )}
                    >
                      <td className="px-3 py-3 tabular-nums font-semibold text-text-muted">
                        {entry.rank}
                      </td>
                      <td className="px-2 py-3">
                        <TeamFlag emoji={team.flagEmoji} name={team.name} size="sm" />
                      </td>
                      <td className="px-3 py-3 font-medium">{team.name}</td>
                      <td className="px-3 py-3 text-text-muted">
                        Group {entry.groupId}
                      </td>
                      <td className="px-3 py-3 text-center font-semibold tabular-nums">
                        {entry.points}
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums text-text-muted">
                        {entry.goalDifference > 0
                          ? `+${entry.goalDifference}`
                          : entry.goalDifference}
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums text-text-muted">
                        {entry.goalsFor}
                      </td>
                      <td className="px-3 py-3">
                        {qualifies ? (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
                            aria-label="Advances to Round of 32"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            R32
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400"
                            aria-label="Eliminated"
                          >
                            <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            Out
                          </span>
                        )}
                      </td>
                    </tr>
                    {isCutoff && (
                      <tr aria-hidden="true" className="border-b border-border">
                        <td
                          colSpan={8}
                          className="bg-surface-2 px-3 py-1.5 text-center text-xs font-medium uppercase tracking-widest text-text-muted"
                        >
                          ── R32 qualification cut ──
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
