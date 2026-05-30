"use client"

import {
  communityPicks,
  groups,
  matches,
  teams,
} from "@/src/data"
import { buildTeamMap } from "@/src/lib/teams"
import { CommunityPickBar } from "@/src/components/community/CommunityPickBar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"

const teamsById = buildTeamMap(teams)
const matchesById = Object.fromEntries(matches.map((match) => [match.id, match]))

const picksByGroup: Record<string, typeof communityPicks> = {}
for (const group of groups) {
  picksByGroup[group.id] = communityPicks.filter((pick) => {
    const match = matchesById[pick.matchId]
    return match?.groupId === group.id
  })
}

interface CommunityPicksSectionProps {
  skeleton?: boolean
}

export function CommunityPicksSection({
  skeleton = false,
}: CommunityPicksSectionProps) {
  if (skeleton) {
    return (
      <section aria-labelledby="community-picks-heading">
        <h2 id="community-picks-heading" className="mb-4 text-lg font-semibold">
          Community Picks
        </h2>
        <div
          className="space-y-3 rounded-lg border border-border bg-surface p-4"
          aria-busy="true"
          aria-label="Loading community picks"
        >
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-8 w-16 shrink-0 animate-pulse rounded bg-surface-2"
              />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-lg bg-surface-2"
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="community-picks-heading">
      <h2 id="community-picks-heading" className="mb-4 text-lg font-semibold">
        Community Picks
      </h2>

      <Tabs defaultValue="A" className="w-full">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className="inline-flex h-auto w-max min-w-full justify-start bg-surface-2 p-1">
            {groups.map((group) => (
              <TabsTrigger
                key={group.id}
                value={group.id}
                className="shrink-0 min-h-11 px-3 data-[state=active]:bg-surface data-[state=active]:text-gold"
              >
                Group {group.id}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {groups.map((group) => (
          <TabsContent key={group.id} value={group.id} className="mt-4 space-y-3">
            {picksByGroup[group.id]?.map((pick) => {
              const match = matchesById[pick.matchId]
              const homeTeam =
                match?.homeTeamId != null
                  ? teamsById[match.homeTeamId]
                  : undefined
              const awayTeam =
                match?.awayTeamId != null
                  ? teamsById[match.awayTeamId]
                  : undefined

              if (!homeTeam || !awayTeam) return null

              return (
                <CommunityPickBar
                  key={pick.matchId}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                  homePct={pick.homePct}
                  drawPct={pick.drawPct}
                  awayPct={pick.awayPct}
                />
              )
            })}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
