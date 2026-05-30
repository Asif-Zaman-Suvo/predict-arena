"use client"

import { motion } from "framer-motion"
import { useMotionDuration } from "@/src/lib/motion"

interface PageWrapperProps {
  children: React.ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  const duration = useMotionDuration(0.25)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  )
}
