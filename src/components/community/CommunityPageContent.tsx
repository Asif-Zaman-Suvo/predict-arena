"use client"

import {
  CommunityDataProvider,
  useCommunityData,
} from "@/src/contexts/CommunityDataContext"
import { CommunityPicksSection } from "@/src/components/community/CommunityPicksSection"
import { ActivityFeed } from "@/src/components/community/ActivityFeed"
import { JoinCommunityButton } from "@/src/components/community/JoinCommunityButton"
import { CommunitySignInBanner } from "@/src/components/community/CommunitySignInBanner"

function CommunityPageInner() {
  const { joinedUsers, loading } = useCommunityData()
  const predictorCount = joinedUsers.length

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Community Predictions
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {loading
            ? "Loading community predictions…"
            : predictorCount > 0
            ? `Live split from ${predictorCount} community member${predictorCount !== 1 ? "s" : ""} · updates as you predict`
            : "Be the first to join and make predictions!"}
        </p>
        </div>
        <JoinCommunityButton />
      </header>

      <CommunitySignInBanner />
      <CommunityPicksSection skeleton={loading} />
      <ActivityFeed skeleton={loading} />
    </div>
  )
}

export function CommunityPageContent() {
  return (
    <CommunityDataProvider>
      <CommunityPageInner />
    </CommunityDataProvider>
  )
}
