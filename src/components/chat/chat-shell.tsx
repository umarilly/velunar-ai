"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"
import type { User } from "@supabase/supabase-js"
import { AnimatePresence } from "framer-motion"
import { toast } from "sonner"

import { ChatHeader } from "@/components/chat/chat-header"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import { WelcomeScreen } from "@/components/chat/welcome-screen"
import { ConversationSidebar } from "@/components/chat/conversation-sidebar"
import { PendingMessage } from "@/components/chat/pending-message"

interface ChatShellProps {
  user: User | null
  conversationId: string
  initialMessages: UIMessage[]
}

export function ChatShell({ user, conversationId, initialMessages }: ChatShellProps) {
  const [input, setInput] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { conversationId },
      }),
    [conversationId]
  )

  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onFinish: () => setSidebarRefreshKey((k) => k + 1),
  })

  const isStreaming = status === "streaming" || status === "submitted"
  const wasEmptyRef = useRef(initialMessages.length === 0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, isStreaming])

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Something went wrong. Please try again.")
      clearError()
    }
  }, [error, clearError])

  function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return
    if (wasEmptyRef.current) {
      wasEmptyRef.current = false
      window.history.replaceState(null, "", `/c/${conversationId}`)
    }
    sendMessage({ text: trimmed })
    setInput("")
  }

  return (
    <div className="flex h-dvh">
      <ConversationSidebar
        user={user}
        activeId={conversationId}
        refreshKey={sidebarRefreshKey}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader user={user} onOpenSidebar={() => setSidebarOpen(true)} />

        {messages.length === 0 ? (
          <WelcomeScreen onPick={submit} />
        ) : (
          <div className="chat-scrollbar flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-3xl flex-col py-4">
              <AnimatePresence initial={false}>
                {messages.map((message, i) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isStreaming={
                      isStreaming &&
                      i === messages.length - 1 &&
                      message.role === "assistant"
                    }
                  />
                ))}
                {status === "submitted" && <PendingMessage key="pending" />}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          </div>
        )}

        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={() => submit(input)}
          onStop={stop}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  )
}
