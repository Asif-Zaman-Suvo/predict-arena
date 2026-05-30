"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useUserStore } from "@/src/stores/user.store"
import { useHydrated } from "@/src/stores/hydration"
import { canAccessApp } from "@/src/lib/user-access"
import { OnboardingDialog } from "./OnboardingDialog"

export function OnboardingGate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated()
  const hasOnboarded = useUserStore((s) => s.hasOnboarded)
  const displayName = useUserStore((s) => s.displayName)
  const pathname = usePathname()
  const router = useRouter()

  const allowed = canAccessApp({ hasOnboarded, displayName })

  useEffect(() => {
    if (hydrated && !allowed && pathname !== "/") {
      router.replace("/")
    }
  }, [hydrated, allowed, pathname, router])

  const showPage =
    !hydrated || allowed || pathname === "/"

  return (
    <>
      <OnboardingDialog />
      {showPage ? children : null}
    </>
  )
}
