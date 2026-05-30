import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatDate(
  date: string,
  options?: { relative?: boolean }
): string {
  const d = new Date(date)

  if (options?.relative) {
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const absDiff = Math.abs(diffMs)
    const minutes = Math.floor(absDiff / 60_000)
    const hours = Math.floor(absDiff / 3_600_000)
    const days = Math.floor(absDiff / 86_400_000)
    const past = diffMs >= 0

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ${past ? "ago" : "from now"}`
    if (hours < 24) return `${hours}h ${past ? "ago" : "from now"}`
    if (days < 7) return `${days}d ${past ? "ago" : "from now"}`
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  })
}

export function formatScore(homeScore: number, awayScore: number): string {
  return `${homeScore} \u2013 ${awayScore}`
}
