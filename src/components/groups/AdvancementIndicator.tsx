import { CheckCircle2, CircleDot, XCircle } from "lucide-react"
import type { AdvancementStatus } from "@/src/types/tournament"
import { cn } from "@/src/lib/utils"

const STATUS_CONFIG = {
  advances: {
    label: "Advances",
    icon: CheckCircle2,
    className: "text-success",
  },
  maybe: {
    label: "Best 3rd place contender",
    icon: CircleDot,
    className: "text-gold",
  },
  eliminated: {
    label: "Eliminated",
    icon: XCircle,
    className: "text-danger",
  },
  tbd: {
    label: "To be determined",
    icon: CircleDot,
    className: "text-text-muted",
  },
} as const

interface AdvancementIndicatorProps {
  status: AdvancementStatus
  className?: string
}

export function AdvancementIndicator({
  status,
  className,
}: AdvancementIndicatorProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  )
}

export function getRowBorderClass(
  position: number,
  status: AdvancementStatus,
): string {
  if (status === "advances" && position === 3) return "border-l-gold"
  if (position <= 1) return "border-l-success"
  if (position === 2) return "border-l-gold"
  if (position === 3 || status === "eliminated") return "border-l-danger"
  return "border-l-transparent"
}
