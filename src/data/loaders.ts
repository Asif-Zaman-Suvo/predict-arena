import { groups, matches, teams, venues, leaderboard } from "@/src/data"
import { buildTeamMap } from "@/src/lib/teams"
import { simulatePersistDelay } from "@/src/lib/delay"
import type { Group, Match, Team, Venue } from "@/src/types/tournament"
import type { LeaderboardEntry } from "@/src/types/leaderboard"

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

export interface LeaderboardBundle {
  leaderboard: LeaderboardEntry[]
}

function buildMatchesByGroup(allMatches: Match[]): Record<string, Match[]> {
  const map: Record<string, Match[]> = {}
  for (const group of groups) {
    map[group.id] = allMatches.filter(
      (m) => m.groupId === group.id && m.stage === "group",
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

async function loadLeaderboardBundleImpl(): Promise<LeaderboardBundle> {
  await simulatePersistDelay()
  return { leaderboard }
}

let fixturesPromise: Promise<FixturesBundle> | null = null
let groupsPromise: Promise<GroupsBundle> | null = null
let leaderboardPromise: Promise<LeaderboardBundle> | null = null

export function loadFixturesBundle(): Promise<FixturesBundle> {
  fixturesPromise ??= loadFixturesBundleImpl()
  return fixturesPromise
}

export function loadGroupsBundle(): Promise<GroupsBundle> {
  groupsPromise ??= loadGroupsBundleImpl()
  return groupsPromise
}

export function loadLeaderboardBundle(): Promise<LeaderboardBundle> {
  leaderboardPromise ??= loadLeaderboardBundleImpl()
  return leaderboardPromise
}
