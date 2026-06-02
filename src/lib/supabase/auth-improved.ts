/**
 * Improved Authentication Utilities
 * Handles rate limits and better error handling
 */

import { supabase } from './client'
import type { AuthError } from '@supabase/supabase-js'

export interface AuthResult {
  success: boolean
  error?: string
  requiresAction?: boolean
  user?: any
}

/**
 * Check if an error is due to rate limiting
 */
export function isRateLimitError(error: AuthError | null): boolean {
  if (!error) return false
  return error.message?.includes('rate limit') ||
         error.message?.includes('over_email_send_rate_limit') ||
         error.status === 429
}

/**
 * Get user-friendly error message
 */
export function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) return 'Authentication failed'

  if (isRateLimitError(error)) {
    return 'Too many authentication attempts. Please wait a few minutes before trying again.'
  }

  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password'
  }

  if (error.message?.includes('User already registered')) {
    return 'An account with this email already exists'
  }

  if (error.message?.includes('Email not confirmed') || error.code === 'email_not_confirmed') {
    return 'Please check your email and confirm your account, or disable email confirmation in Supabase settings'
  }

  return error.message || 'Authentication failed'
}

/**
 * Sign up with email and password
 * Note: Email confirmation should be disabled in Supabase Dashboard settings
 * Go to: Authentication → Settings → Disable "Enable email confirmation"
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  try {
    const avatarSeed = crypto.randomUUID()
    const trimmedName = displayName.trim()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: trimmedName,
          avatar_seed: avatarSeed,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (isRateLimitError(error)) {
        return {
          success: false,
          error: getAuthErrorMessage(error),
          requiresAction: true
        }
      }
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }

    // If we have a session, user was created and signed in successfully
    if (data.session) {
      return {
        success: true,
        user: data.user
      }
    }

    // If no session but user exists, they may need to sign in manually
    if (data.user) {
      return {
        success: true,
        requiresAction: false,
        user: data.user
      }
    }

    return {
      success: true,
      requiresAction: false
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Sign up failed'
    }
  }
}

/**
 * Sign in with email and password
 * Note: If email confirmation is enabled, users will need to confirm their email first
 * To disable email confirmation: Go to Supabase Dashboard → Authentication → Settings
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }

    return {
      success: true,
      user: data.user
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Sign in failed'
    }
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: error.message }
    }
    return {}
  } catch (error: any) {
    return { error: error.message || 'Sign out failed' }
  }
}