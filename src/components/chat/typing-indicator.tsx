"use client"

import { motion } from "framer-motion"

const DOT_TRANSITION = (delay: number) => ({
  duration: 0.9,
  repeat: Infinity,
  ease: "easeInOut" as const,
  delay,
})

export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 px-1 py-1.5"
      role="status"
      aria-label="Velunar is typing"
    >
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground/60"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={DOT_TRANSITION(delay)}
        />
      ))}
    </div>
  )
}
