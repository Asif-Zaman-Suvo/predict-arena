import type { ActivityItem as ActivityItemType } from "@/src/types/community"
import type { LeaderboardEntry } from "@/src/types/leaderboard"
import type { Match, Team } from "@/src/types/tournament"
import type { MatchPrediction } from "@/src/types/predictions"
import { getDiceBearAvatarUrl } from "@/src/lib/avatars"
import { formatDate, formatScore } from "@/src/lib/utils"

interface ActivityItemProps {
  item: ActivityItemType
  user: LeaderboardEntry | undefined
  match?: Match
  homeTeam?: Team
  awayTeam?: Team
  prediction?: MatchPrediction | null
}

function buildActivityText({
  item,
  user,
  match,
  homeTeam,
  awayTeam,
  prediction,
}: ActivityItemProps): string {
  const displayName = user?.displayName ?? "Unknown user"

  switch (item.type) {
    case "prediction": {
      const homeName = homeTeam?.name ?? "TBD"
      const awayName = awayTeam?.name ?? "TBD"
      const score = prediction
        ? formatScore(prediction.homeScore, prediction.awayScore)
        : "—"
      return `${displayName} predicted ${score} for ${homeName} vs ${awayName}`
    }
    case "comment":
      return `${displayName}: ${item.content ?? ""}`
    case "join":
      return `${displayName} joined the arena`
    default:
      return displayName
  }
}

export function ActivityItem(props: ActivityItemProps) {
  const { item, user } = props
  const displayName = user?.displayName ?? "Unknown user"
  const text = buildActivityText(props)

  return (
    <li className="flex gap-3 border-b border-border py-4 last:border-b-0">
      <img
        src={getDiceBearAvatarUrl(user?.avatarSeed ?? item.userId)}
        alt={`${displayName} avatar`}
        className="h-9 w-9 shrink-0 rounded-full bg-surface-2"
        width={36}
        height={36}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{text}</p>
        <time
          dateTime={item.timestamp}
          className="mt-1 block text-xs text-text-muted"
        >
          {formatDate(item.timestamp, { relative: true })}
        </time>
      </div>
    </li>
  )
}
