"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Sparkles, User } from "lucide-react"
import type { UIMessage } from "ai"

import { cn } from "@/lib/utils"
import { TypingIndicator } from "@/components/chat/typing-indicator"

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "assistant") {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-4" />
      </div>
    )
  }
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
      <User className="size-4" />
    </div>
  )
}

function MarkdownBody({ text }: { text: string }) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none break-words",
        "prose-p:my-2 prose-p:leading-relaxed first:prose-p:mt-0 last:prose-p:mb-0",
        "prose-headings:font-heading prose-headings:font-semibold",
        "prose-a:text-primary prose-a:underline prose-a:underline-offset-2",
        "prose-strong:text-inherit prose-code:before:content-none prose-code:after:content-none",
        "prose-code:rounded prose-code:bg-foreground/10 prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:font-mono prose-code:font-normal",
        "prose-pre:bg-foreground/5 prose-pre:text-foreground prose-pre:border prose-pre:border-border prose-pre:rounded-lg",
        "prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5"
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  )
}

interface ChatMessageProps {
  message: UIMessage
  isStreaming?: boolean
}

function ChatMessageInner({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user"
  const textParts = message.parts.filter(
    (part): part is Extract<typeof part, { type: "text" }> =>
      part.type === "text"
  )
  const text = textParts.map((part) => part.text).join("")

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex w-full gap-3 px-4 py-3 sm:px-0",
        isUser && "flex-row-reverse"
      )}
    >
      <Avatar role={isUser ? "user" : "assistant"} />
      <div
        className={cn(
          "flex min-w-0 flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <span className="px-1 text-xs font-medium text-muted-foreground">
          {isUser ? "You" : "Velunar"}
        </span>
        <div
          className={cn(
            "min-w-0 max-w-[min(42rem,85vw)] rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border border-border bg-card text-card-foreground"
          )}
        >
          {text.length === 0 && isStreaming ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {text}
            </p>
          ) : (
            <MarkdownBody text={text} />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export const ChatMessage = memo(ChatMessageInner)
