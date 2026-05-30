import type { R32Matchup } from "@/src/types/tournament"

/** How a team is assigned to an R32 slot. */
export type R32SlotTeamRef =
  | { type: "winner"; groupId: string }
  | { type: "runner-up"; groupId: string }
  | { type: "third"; candidateGroups: string[] }

export interface R32SlotDefinition {
  matchId: string
  home: R32SlotTeamRef
  away: R32SlotTeamRef
}

/**
 * FIFA World Cup 2026 Round of 32 slot definitions.
 * Left column (k-r32-1..8) then right column (k-r32-9..16), top to bottom.
 * Third-place slots list eligible groups; assignment is resolved at runtime
 * from the top-8 best-third ranking.
 */
export const R32_SLOT_DEFINITIONS: R32SlotDefinition[] = [
  {
    matchId: "k-r32-1",
    home: { type: "winner", groupId: "E" },
    away: { type: "third", candidateGroups: ["A", "B", "C", "D", "F"] },
  },
  {
    matchId: "k-r32-2",
    home: { type: "winner", groupId: "I" },
    away: { type: "third", candidateGroups: ["C", "D", "F", "G", "H"] },
  },
  {
    matchId: "k-r32-3",
    home: { type: "runner-up", groupId: "A" },
    away: { type: "runner-up", groupId: "B" },
  },
  {
    matchId: "k-r32-4",
    home: { type: "winner", groupId: "F" },
    away: { type: "runner-up", groupId: "C" },
  },
  {
    matchId: "k-r32-5",
    home: { type: "runner-up", groupId: "K" },
    away: { type: "runner-up", groupId: "L" },
  },
  {
    matchId: "k-r32-6",
    home: { type: "winner", groupId: "H" },
    away: { type: "runner-up", groupId: "J" },
  },
  {
    matchId: "k-r32-7",
    home: { type: "winner", groupId: "D" },
    away: { type: "third", candidateGroups: ["B", "E", "F", "I", "J"] },
  },
  {
    matchId: "k-r32-8",
    home: { type: "winner", groupId: "G" },
    away: { type: "third", candidateGroups: ["A", "E", "H", "I", "J"] },
  },
  {
    matchId: "k-r32-9",
    home: { type: "winner", groupId: "C" },
    away: { type: "runner-up", groupId: "F" },
  },
  {
    matchId: "k-r32-10",
    home: { type: "runner-up", groupId: "E" },
    away: { type: "runner-up", groupId: "I" },
  },
  {
    matchId: "k-r32-11",
    home: { type: "winner", groupId: "A" },
    away: { type: "third", candidateGroups: ["C", "E", "F", "H", "I"] },
  },
  {
    matchId: "k-r32-12",
    home: { type: "winner", groupId: "L" },
    away: { type: "third", candidateGroups: ["E", "H", "I", "J", "K"] },
  },
  {
    matchId: "k-r32-13",
    home: { type: "winner", groupId: "J" },
    away: { type: "runner-up", groupId: "H" },
  },
  {
    matchId: "k-r32-14",
    home: { type: "runner-up", groupId: "D" },
    away: { type: "runner-up", groupId: "G" },
  },
  {
    matchId: "k-r32-15",
    home: { type: "winner", groupId: "B" },
    away: { type: "third", candidateGroups: ["E", "F", "G", "I", "J"] },
  },
  {
    matchId: "k-r32-16",
    home: { type: "winner", groupId: "K" },
    away: { type: "third", candidateGroups: ["D", "E", "I", "J", "L"] },
  },
]

export function r32MatchupsToRecord(
  matchups: R32Matchup[],
): Record<string, R32Matchup> {
  return Object.fromEntries(matchups.map((m) => [m.matchId, m]))
}
