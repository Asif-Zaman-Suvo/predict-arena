"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/src/lib/supabase/client'
import type { DatabaseUser } from '@/src/types/database'
import {
  signUpWithEmail,
  signInWithEmail,
  signOut as supabaseSignOut,
  getAuthErrorMessage,
  isRateLimitError
} from '@/src/lib/supabase/auth-improved'

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: DatabaseUser | null
  loading: boolean
  isRateLimited: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null; requiresAction?: boolean }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null; requiresAction?: boolean }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<DatabaseUser>) => Promise<void>
  joinCommunity: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<DatabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRateLimited, setIsRateLimited] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        const metaName =
          (session.user.user_metadata?.display_name as string | undefined)?.trim() ??
          ''
        const metaSeed =
          (session.user.user_metadata?.avatar_seed as string | undefined) ?? ''

        if (
          (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') &&
          metaName
        ) {
          await ensureUserProfile(
            session.user,
            metaName,
            metaSeed || crypto.randomUUID(),
          )
        } else {
          await fetchUserProfile(session.user.id)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setUserProfile(data)
    }
  }

  /** Fallback when trigger missed or email-confirm delayed session. Requires active session. */
  const ensureUserProfile = async (
    authUser: User,
    displayName: string,
    avatarSeed: string,
  ) => {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle()

    if (existing) {
      await fetchUserProfile(authUser.id)
      return null
    }

    const joinedAt = new Date().toISOString()
    const { error } = await supabase.from('users').insert({
      id: authUser.id,
      display_name: displayName,
      avatar_seed: avatarSeed,
      joined_at: joinedAt,
    })

    if (!error) {
      await fetchUserProfile(authUser.id)
    }

    return error
  }

  const signIn = async (email: string, password: string) => {
    setIsRateLimited(false)
    const result = await signInWithEmail(email, password)

    if (result.error && isRateLimitError({ message: result.error } as AuthError)) {
      setIsRateLimited(true)
    }

    return { error: result.error || null, requiresAction: result.requiresAction }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    setIsRateLimited(false)
    const result = await signUpWithEmail(email, password, displayName)

    if (result.error && isRateLimitError({ message: result.error } as AuthError)) {
      setIsRateLimited(true)
    }

    return { error: result.error || null, requiresAction: result.requiresAction }
  }

  const signOutHandler = async () => {
    await supabaseSignOut()
    setIsRateLimited(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<DatabaseUser>) => {
    if (!user) return

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      await fetchUserProfile(user.id)
    } else {
      throw error
    }
  }

  const joinCommunity = async () => {
    if (!user) return
    await updateProfile({ joined_at: new Date().toISOString() })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        loading,
        isRateLimited,
        signIn,
        signUp,
        signOut: signOutHandler,
        updateProfile,
        joinCommunity,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}