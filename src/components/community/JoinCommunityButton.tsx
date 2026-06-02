"use client"

import { useCommunityData } from "@/src/hooks/use-community-data"
import { useAuth } from "@/src/contexts/AuthContext"

export function JoinCommunityButton() {
  const { hasJoined, loading } = useCommunityData()
  const { joinCommunity, user } = useAuth()

  if (!user || hasJoined || loading) {
    return null
  }

  return (
    <button
      onClick={joinCommunity}
      className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-surface-9 hover:bg-gold/90 transition-colors"
    >
      Join Community
    </button>
  )
}