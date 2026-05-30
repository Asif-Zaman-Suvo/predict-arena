"use client"

import Link from "next/link"
import type { ComponentProps } from "react"
import { useUserStore } from "@/src/stores/user.store"
import { useHydrated } from "@/src/stores/hydration"
import { canAccessApp } from "@/src/lib/user-access"

type GuardedLinkProps = ComponentProps<typeof Link>

export function GuardedLink({ href, onClick, ...props }: GuardedLinkProps) {
  const hydrated = useHydrated()
  const hasOnboarded = useUserStore((s) => s.hasOnboarded)
  const displayName = useUserStore((s) => s.displayName)
  const allowed = canAccessApp({ hasOnboarded, displayName })

  const target = typeof href === "string" ? href : (href.pathname ?? "/")
  const isHome = target === "/"

  return (
    <Link
      href={href}
      onClick={(e) => {
        if (hydrated && !allowed && !isHome) {
          e.preventDefault()
        }
        onClick?.(e)
      }}
      aria-disabled={hydrated && !allowed && !isHome ? true : undefined}
      {...props}
    />
  )
}
