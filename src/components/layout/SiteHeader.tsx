"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { usePredictionsStore } from "@/src/stores/predictions.store"
import { useUserStore } from "@/src/stores/user.store"
import { useHydrated } from "@/src/stores/hydration"
import {
  GROUP_MATCH_COUNT,
  countCompletedGroupPredictions,
} from "@/src/lib/tournament"
import { MobileNav } from "./MobileNav"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/groups", label: "Groups" },
  { href: "/brackets", label: "Brackets" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/community", label: "Community" },
  { href: "/profile", label: "Profile" },
]

function UserPill() {
  const hydrated = useHydrated()
  const displayName = useUserStore((s) => s.displayName)
  const hasOnboarded = useUserStore((s) => s.hasOnboarded)

  if (!hydrated || !hasOnboarded || !displayName) return null

  return (
    <span
      className="hidden max-w-32 truncate rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-foreground sm:inline-flex"
      aria-label={`Signed in as ${displayName}`}
      title={displayName}
    >
      {displayName}
    </span>
  )
}

function PredictionPill() {
  const hydrated = useHydrated()
  const matchPredictions = usePredictionsStore((s) => s.matchPredictions)

  const completed = hydrated
    ? countCompletedGroupPredictions(matchPredictions)
    : null

  return (
    <span
      className="hidden rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-text-muted sm:inline-flex"
      aria-label="Prediction progress"
    >
      {completed === null ? "—" : `${completed} / ${GROUP_MATCH_COUNT}`}
    </span>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur supports-backdrop-filter:bg-surface/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          {/* Logo */}
          <Link
            href="/"
            className="mr-2 flex shrink-0 items-center gap-2 font-semibold text-gold"
            aria-label="FIFA WC 2026 Predictor — home"
          >
            <span className="text-lg leading-none">⚽</span>
            <span className="hidden text-sm sm:block">WC 2026</span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden flex-1 items-center gap-1 md:flex"
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href)

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex h-14 items-center px-3 text-sm transition-colors",
                    "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transition-colors",
                    isActive
                      ? "font-medium text-foreground after:bg-gold"
                      : "text-text-muted hover:text-foreground after:bg-transparent",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Spacer on mobile */}
          <div className="flex-1 md:hidden" />

          {/* User name + prediction progress pills */}
          <UserPill />
          <PredictionPill />

          {/* Hamburger — visible only ≤ md */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-2 hover:text-foreground md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  )
}
