"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface UserState {
  displayName: string
  avatarSeed: string
  hasOnboarded: boolean
}

interface UserActions {
  setDisplayName: (name: string) => void
  completeOnboarding: () => void
}

type UserStore = UserState & UserActions

function generateSeed(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      displayName: "",
      avatarSeed: generateSeed(),
      hasOnboarded: false,

      setDisplayName: (name) => set({ displayName: name }),
      completeOnboarding: () => set({ hasOnboarded: true }),
    }),
    {
      name: "pa:user",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
