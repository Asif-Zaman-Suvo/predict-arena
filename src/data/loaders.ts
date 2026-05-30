import { groups, matches, teams, venues } from "@/src/data"
import { buildTeamMap } from "@/src/lib/teams"
import { simulatePersistDelay } from "@/src/lib/delay"
import type { Group, Match, Team, Venue } from "@/src/types/tournament"

export interface FixturesBundle {
  groups: Group[]
  matches: Match[]
  teams: Team[]
  teamsById: Record<string, Team>
  venuesById: Record<string, Venue>
  matchesByGroup: Record<string, Match[]>
}

export interface GroupsBundle {
  groups: Group[]
  teamsById: Record<string, Team>
}

function buildMatchesByGroup(allMatches: Match[]): Record<string, Match[]> {
  const map: Record<string, Match[]> = {}
  for (const group of groups) {
    map[group.id] = allMatches
      .filter((m) => m.groupId === group.id && m.stage === "group")
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
  }
  return map
}

async function loadFixturesBundleImpl(): Promise<FixturesBundle> {
  await simulatePersistDelay()
  const groupMatches = matches.filter((m) => m.stage === "group")
  return {
    groups,
    matches: groupMatches,
    teams,
    teamsById: buildTeamMap(teams),
    venuesById: Object.fromEntries(venues.map((v) => [v.id, v])),
    matchesByGroup: buildMatchesByGroup(matches),
  }
}

async function loadGroupsBundleImpl(): Promise<GroupsBundle> {
  await simulatePersistDelay()
  return { groups, teamsById: buildTeamMap(teams) }
}

let fixturesPromise: Promise<FixturesBundle> | null = null
let groupsPromise: Promise<GroupsBundle> | null = null

export function loadFixturesBundle(): Promise<FixturesBundle> {
  fixturesPromise ??= loadFixturesBundleImpl()
  return fixturesPromise
}

export function loadGroupsBundle(): Promise<GroupsBundle> {
  groupsPromise ??= loadGroupsBundleImpl()
  return groupsPromise
}
