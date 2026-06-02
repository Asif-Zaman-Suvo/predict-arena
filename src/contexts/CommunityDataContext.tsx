"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { supabase } from "@/src/lib/supabase/client"
import { useAuth } from "@/src/contexts/AuthContext"
import { GROUP_MATCH_IDS } from "@/src/lib/community-predictions"
import type { DatabaseUser, DatabasePrediction } from "@/src/types/database"
import type { CommunityPickPercentage } from "@/src/types/community"
import type { MatchPrediction } from "@/src/types/predictions"

interface CommunityDataValue {
  joinedUsers: DatabaseUser[]
  communityPicks: CommunityPickPercentage[]
  userPredictions: Record<string, MatchPrediction>
  loading: boolean
  hasJoined: boolean
  currentUser: DatabaseUser | null
}

const CommunityDataContext = createContext<CommunityDataValue | null>(null)

function normalizePercentages(
  home: number,
  draw: number,
  away: number,
  total: number,
): Pick<CommunityPickPercentage, "homePct" | "drawPct" | "awayPct"> {
  if (total === 0) return { homePct: 0, drawPct: 0, awayPct: 0 }

  let homePct = Math.round((home / total) * 100)
  let drawPct = Math.round((draw / total) * 100)
  let awayPct = Math.round((away / total) * 100)
  const drift = 100 - (homePct + drawPct + awayPct)

  if (drift !== 0) {
    if (home >= draw && home >= away) homePct += drift
    else if (draw >= away) drawPct += drift
    else awayPct += drift
  }

  return { homePct, drawPct, awayPct }
}

function upsertPredictionRow(
  prev: DatabasePrediction[],
  row: DatabasePrediction,
): DatabasePrediction[] {
  const idx = prev.findIndex(
    (p) => p.user_id === row.user_id && p.match_id === row.match_id,
  )
  if (idx === -1) return [...prev, row]
  const next = [...prev]
  next[idx] = row
  return next
}

function removePredictionRow(
  prev: DatabasePrediction[],
  row: DatabasePrediction,
): DatabasePrediction[] {
  return prev.filter(
    (p) =>
      !(
        p.user_id === row.user_id &&
        p.match_id === row.match_id
      ),
  )
}

export function CommunityDataProvider({ children }: { children: ReactNode }) {
  const { user, userProfile } = useAuth()
  const [joinedUsers, setJoinedUsers] = useState<DatabaseUser[]>([])
  const [allPredictions, setAllPredictions] = useState<DatabasePrediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      const [usersResult, predictionsResult] = await Promise.all([
        supabase
          .from("users")
          .select("*")
          .not("joined_at", "is", null)
          .order("joined_at", { ascending: false }),
        supabase.from("predictions").select("*"),
      ])

      if (cancelled) return

      if (!usersResult.error && usersResult.data) {
        setJoinedUsers(usersResult.data)
      }
      if (!predictionsResult.error && predictionsResult.data) {
        setAllPredictions(predictionsResult.data)
      }

      setLoading(false)
    }

    void load()

    const usersChannel = supabase
      .channel("community-users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newUser = payload.new as DatabaseUser
            if (newUser.joined_at) {
              setJoinedUsers((prev) => {
                const filtered = prev.filter((u) => u.id !== newUser.id)
                return [newUser, ...filtered]
              })
            } else {
              setJoinedUsers((prev) => prev.filter((u) => u.id !== newUser.id))
            }
          }
        },
      )
      .subscribe()

    const predictionsChannel = supabase
      .channel("community-predictions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "predictions" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAllPredictions((prev) =>
              upsertPredictionRow(prev, payload.new as DatabasePrediction),
            )
          } else if (payload.eventType === "UPDATE") {
            setAllPredictions((prev) =>
              upsertPredictionRow(prev, payload.new as DatabasePrediction),
            )
          } else if (payload.eventType === "DELETE") {
            setAllPredictions((prev) =>
              removePredictionRow(prev, payload.old as DatabasePrediction),
            )
          }
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      void supabase.removeChannel(usersChannel)
      void supabase.removeChannel(predictionsChannel)
    }
  }, [])

  const communityPicks = useMemo((): CommunityPickPercentage[] => {
    const picksByMatch: Record<
      string,
      { home: number; draw: number; away: number }
    > = {}

    for (const matchId of GROUP_MATCH_IDS) {
      picksByMatch[matchId] = { home: 0, draw: 0, away: 0 }
    }

    for (const prediction of allPredictions) {
      const { match_id, home_score, away_score } = prediction
      if (!GROUP_MATCH_IDS.includes(match_id)) continue

      if (home_score > away_score) picksByMatch[match_id].home++
      else if (home_score < away_score) picksByMatch[match_id].away++
      else picksByMatch[match_id].draw++
    }

    return GROUP_MATCH_IDS.map((matchId) => {
      const counts = picksByMatch[matchId]
      const total = counts.home + counts.draw + counts.away
      const { homePct, drawPct, awayPct } = normalizePercentages(
        counts.home,
        counts.draw,
        counts.away,
        total,
      )
      return { matchId, homePct, drawPct, awayPct }
    })
  }, [allPredictions])

  const userPredictions = useMemo((): Record<string, MatchPrediction> => {
    if (!user) return {}

    return Object.fromEntries(
      allPredictions
        .filter((p) => p.user_id === user.id)
        .map((p) => [
          p.match_id,
          { homeScore: p.home_score, awayScore: p.away_score },
        ]),
    )
  }, [allPredictions, user])

  const value: CommunityDataValue = {
    joinedUsers,
    communityPicks,
    userPredictions,
    loading,
    hasJoined: userProfile?.joined_at != null,
    currentUser: userProfile,
  }

  return (
    <CommunityDataContext.Provider value={value}>
      {children}
    </CommunityDataContext.Provider>
  )
}

export function useCommunityData(): CommunityDataValue {
  const ctx = useContext(CommunityDataContext)
  if (!ctx) {
    throw new Error(
      "useCommunityData must be used within CommunityDataProvider",
    )
  }
  return ctx
}
