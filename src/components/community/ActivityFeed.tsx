"use client"

import { useCommunityData } from "@/src/hooks/use-community-data"
import { useAuth } from "@/src/contexts/AuthContext"
import { getDiceBearAvatarUrl } from "@/src/lib/avatars"
import { useHydrated } from "@/src/stores/hydration"

interface ActivityFeedProps {
  skeleton?: boolean
}

export function ActivityFeed({ skeleton = false }: ActivityFeedProps) {
  const hydrated = useHydrated()
  const { joinedUsers, loading } = useCommunityData()
  const { user } = useAuth()

  if (skeleton || !hydrated || loading) {
    return (
      <section aria-labelledby="activity-feed-heading">
        <h2 id="activity-feed-heading" className="mb-4 text-lg font-semibold">
          Who&apos;s Joined
        </h2>
        <div
          className="rounded-lg border border-border bg-surface p-4"
          aria-busy="true"
          aria-label="Loading activity feed"
        >
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex animate-pulse gap-3">
                <div className="h-9 w-9 rounded-full bg-surface-2 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-surface-2" />
                  <div className="h-3 w-20 rounded bg-surface-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const allJoinedUsers = joinedUsers.map((entry) => ({
    ...entry,
    isCurrentUser: user ? entry.id === user.id : false,
  }))

  if (allJoinedUsers.length === 0) {
    return (
      <section aria-labelledby="activity-feed-heading">
        <h2 id="activity-feed-heading" className="mb-4 text-lg font-semibold">
          Who&apos;s Joined
        </h2>
        <div className="rounded-lg border border-border bg-surface p-6 text-center text-sm text-text-muted">
          Be the first to join the arena!
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="activity-feed-heading">
      <h2 id="activity-feed-heading" className="mb-4 text-lg font-semibold">
        Who&apos;s Joined
      </h2>

      <div className="rounded-lg border border-border bg-surface px-4">
        <ul aria-live="polite" className="divide-y divide-border">
          {allJoinedUsers.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 py-4 last:border-b-0"
            >
              <img
                src={getDiceBearAvatarUrl(entry.avatar_seed)}
                alt={`${entry.display_name} avatar`}
                className="h-9 w-9 shrink-0 rounded-full bg-surface-2"
                width={36}
                height={36}
              />
              <p className="text-sm text-foreground">
                <span
                  className={
                    entry.isCurrentUser ? "font-semibold text-gold" : ""
                  }
                >
                  {entry.display_name}
                </span>{" "}
                joined the arena
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
