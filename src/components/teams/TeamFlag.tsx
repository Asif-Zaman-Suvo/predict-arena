import { cn } from "@/src/lib/utils"

const SIZE_CLASS = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
} as const

export type TeamFlagSize = keyof typeof SIZE_CLASS

interface TeamFlagProps {
  emoji: string
  name: string
  size?: TeamFlagSize
  className?: string
}

export function TeamFlag({
  emoji,
  name,
  size = "md",
  className,
}: TeamFlagProps) {
  return (
    <span
      role="img"
      aria-label={`${name} flag`}
      className={cn("inline-block leading-none", SIZE_CLASS[size], className)}
    >
      {emoji}
    </span>
  )
}
