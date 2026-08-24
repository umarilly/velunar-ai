"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

import { TypingIndicator } from "@/components/chat/typing-indicator"

export function PendingMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex w-full gap-3 px-4 py-3 sm:px-0"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
        <motion.span
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="size-4" />
        </motion.span>
      </div>
      <div className="flex min-w-0 flex-col items-start gap-1">
        <span className="px-1 text-xs font-medium text-muted-foreground">
          Velunar
        </span>
        <div className="min-w-0 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm">
          <TypingIndicator />
        </div>
      </div>
    </motion.div>
  )
}
