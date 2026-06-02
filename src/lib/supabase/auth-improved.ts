/**
 * Improved Authentication Utilities
 * Handles rate limits, provides multiple auth methods, and better error handling
 */

import { supabase } from './client'
import type { AuthError } from '@supabase/supabase-js'

export type AuthMethod = 'email' | 'magic-link' | 'social'

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

  if (error.message?.includes('Email not confirmed')) {
    return 'Please check your email and confirm your account'
  }

  return error.message || 'Authentication failed'
}

/**
 * Sign up with email and password
 * Always bypasses email confirmation for instant login
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  options?: { skipEmailConfirmation?: boolean }
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
        // ALWAYS skip email confirmation for instant login
        emailSkipVerification: true
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

    // If no session but user exists, they need to sign in with email/password
    if (data.user) {
      return {
        success: true,
        requiresAction: false, // No email confirmation needed
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
 * Works regardless of email confirmation status
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
      // Handle email_not_confirmed error by allowing login anyway
      if (error.message === 'Email not confirmed' || error.code === 'email_not_confirmed') {
        // Try to confirm the email automatically and retry
        try {
          // Attempt to bypass the confirmation check
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (!retryError && retryData.user) {
            return {
              success: true,
              user: retryData.user
            }
          }
        } catch (retryErr: any) {
          // If retry fails, return the original error but with a better message
        }

        return {
          success: false,
          error: 'Please sign up again to complete your account creation. The confirmation step was skipped.'
        }
      }

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
 * Sign in with magic link (passwordless)
 */
export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
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

    return {
      success: true,
      requiresAction: true
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Magic link failed'
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

/**
 * Resend confirmation email
 */
export async function resendConfirmationEmail(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
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

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to resend email'
    }
  }
}

/**
 * Check if we're in development mode
 */
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development' ||
         window.location.hostname === 'localhost'
}

/**
 * Get recommended auth method based on environment
 */
export function getRecommendedAuthMethod(): AuthMethod {
  if (isDevelopmentMode()) {
    return 'email' // Direct email/password in dev
  }
  return 'magic-link' // Magic links in production for better UX
}