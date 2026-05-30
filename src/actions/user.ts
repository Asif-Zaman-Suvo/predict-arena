"use client"

import { simulatePersistDelay } from "@/src/lib/delay"
import { useUserStore } from "@/src/stores/user.store"

export type UserActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function completeOnboardingAction(
  _prev: UserActionResult | null,
  formData: FormData,
): Promise<UserActionResult> {
  const displayName = String(formData.get("displayName") ?? "").trim()

  if (!displayName) {
    return { ok: false, error: "Display name is required" }
  }

  await simulatePersistDelay()

  const store = useUserStore.getState()
  store.setDisplayName(displayName)
  store.completeOnboarding()

  return { ok: true }
}

export async function updateDisplayNameAction(
  _prev: UserActionResult | null,
  formData: FormData,
): Promise<UserActionResult> {
  const displayName = String(formData.get("displayName") ?? "").trim()

  if (!displayName) {
    return { ok: false, error: "Display name is required" }
  }

  await simulatePersistDelay()
  useUserStore.getState().setDisplayName(displayName)

  return { ok: true }
}
