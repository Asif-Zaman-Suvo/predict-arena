import type { Match, Venue } from "@/src/types/tournament"

const STAGE_LABELS: Record<string, string> = {
  group: "First Stage",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-final",
  sf: "Semi-final",
  "3rd": "Play-off for third place",
  final: "Final",
}

/** 24-hour kickoff time in the venue's local timezone (e.g. "02:00"). */
export function formatKickoffTime(isoDate: string, timeZone: string): string {
  return new Date(isoDate).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  })
}

export function formatMatchStageLabel(stage: string): string {
  return STAGE_LABELS[stage] ?? stage
}

export function formatVenueLine(venue: Venue): string {
  return `${venue.name} (${venue.city})`
}

export function formatMatchMeta(match: Match, venue: Venue): string {
  const parts = [formatMatchStageLabel(match.stage)]

  if (match.groupId) {
    parts.push(`Group ${match.groupId}`)
  }

  parts.push(formatVenueLine(venue))
  return parts.join(" · ")
}
