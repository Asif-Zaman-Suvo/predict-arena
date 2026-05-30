import type { Team } from "../types/tournament"
import { teams } from "../data"

export function buildTeamMap(teamList: Team[] = teams): Record<string, Team> {
  return Object.fromEntries(teamList.map((team) => [team.id, team]))
}
