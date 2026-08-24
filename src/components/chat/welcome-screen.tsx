"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

import { APP_NAME, APP_TAGLINE, SUGGESTED_PROMPTS } from "@/lib/chat-config"

export function WelcomeScreen({
  onPick,
}: {
  onPick: (prompt: string) => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
      >
        <Sparkles className="size-7" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
        className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        {APP_NAME}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="mt-2 text-sm text-muted-foreground sm:text-base"
      >
        {APP_TAGLINE}
      </motion.p>

      <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((item, i) => (
          <motion.button
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.05, ease: "easeOut" }}
            onClick={() => onPick(item.prompt)}
            className="cursor-pointer rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <p className="text-sm font-medium">{item.title}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {item.prompt}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
