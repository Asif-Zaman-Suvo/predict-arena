"use client"

import { useEffect } from "react"
import { GuardedLink } from "./GuardedLink"
import { usePathname } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet"
import { cn } from "@/src/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/groups", label: "Groups" },
  { href: "/brackets", label: "Brackets" },
  { href: "/community", label: "Community" },
  { href: "/profile", label: "Profile" },
]

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname()

  // Close the sheet whenever the route changes
  useEffect(() => {
    onOpenChange(false)
  }, [pathname, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent id="mobile-nav" side="left" className="w-72 bg-surface p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="text-left text-sm font-semibold text-gold">
            WC 2026 Predictor
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Mobile navigation">
          <ul className="flex flex-col py-2">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href)

              return (
                <li key={href}>
                  <GuardedLink
                    href={href}
                    className={cn(
                      "flex min-h-11 items-center gap-3 px-6 py-3 text-sm transition-colors",
                      isActive
                        ? "border-l-2 border-gold bg-surface-2 font-medium text-gold"
                        : "border-l-2 border-transparent text-text hover:bg-surface-2 hover:text-gold",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {label}
                  </GuardedLink>
                </li>
              )
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
