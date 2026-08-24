"use client"

import type { KeyboardEvent } from "react"
import { ArrowUp, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop: () => void
  isStreaming: boolean
  disabled?: boolean
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isStreaming) {
        onSubmit()
      }
    }
  }

  function handleSubmitClick() {
    if (isStreaming) {
      onStop()
      return
    }
    if (value.trim()) {
      onSubmit()
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4 sm:pb-6">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/[0.03] transition-shadow focus-within:ring-2 focus-within:ring-ring/40 dark:shadow-black/20">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Velunar..."
          rows={1}
          disabled={disabled}
          className="max-h-[200px] min-h-9 resize-none border-0 bg-transparent px-2 py-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        <Button
          type="button"
          size="icon"
          aria-label={isStreaming ? "Stop generating" : "Send message"}
          disabled={!isStreaming && !value.trim()}
          onClick={handleSubmitClick}
          className="mb-0.5 shrink-0 rounded-xl"
        >
          {isStreaming ? (
            <Square className="size-3.5 fill-current" />
          ) : (
            <ArrowUp className="size-4" />
          )}
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Velunar can make mistakes. Consider checking important information.
      </p>
    </div>
  )
}
