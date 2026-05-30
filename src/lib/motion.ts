import { useReducedMotion } from "framer-motion"

export function useMotionDuration(seconds: number): number {
  const reduced = useReducedMotion()
  return reduced ? 0 : seconds
}

export function useMotionDelay(seconds: number): number {
  const reduced = useReducedMotion()
  return reduced ? 0 : seconds
}
