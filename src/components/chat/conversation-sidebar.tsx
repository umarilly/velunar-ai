"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { MessageSquare, PanelLeftClose, PanelLeftOpen, Plus, Trash2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface ConversationRow {
  id: string
  title: string
  updated_at: string
}

interface ConversationSidebarProps {
  user: User | null
  activeId: string
  refreshKey: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConversationSidebar({
  user,
  activeId,
  refreshKey,
  open,
  onOpenChange,
}: ConversationSidebarProps) {
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!user) return

    const supabase = createClient()
    if (!supabase) return

    let cancelled = false
    async function load() {
      const { data } = await supabase!
        .from("conversations")
        .select("id,title,updated_at")
        .order("updated_at", { ascending: false })
        .limit(50)
      if (!cancelled && data) setConversations(data)
    }
    load()

    return () => {
      cancelled = true
    }
  }, [user, refreshKey])

  async function handleDelete(id: string) {
    const supabase = createClient()
    if (!supabase) return
    setConversations((prev) => prev.filter((c) => c.id !== id))
    await supabase.from("conversations").delete().eq("id", id)
    if (id === activeId) {
      router.push("/")
      router.refresh()
    }
  }

  function handleNewChat() {
    onOpenChange(false)
    router.push("/")
    router.refresh()
  }

  const expandedContent = (
    <div className="flex h-full w-full min-w-0 flex-col">
      <div className="flex items-center gap-1.5 border-b border-sidebar-border p-3">
        <Button
          variant="outline"
          className="flex-1 justify-start gap-2"
          onClick={handleNewChat}
        >
          <Plus className="size-4" />
          New chat
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Collapse sidebar"
          className="hidden shrink-0 md:inline-flex"
          onClick={() => setCollapsed(true)}
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>
      <div className="chat-scrollbar flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2">
            <MessageSquare className="size-9 text-sidebar-foreground/25" />
            <p className="text-xs text-sidebar-foreground/50">No conversations yet</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {conversations.map((c) => (
              <li key={c.id} className="group/item relative">
                <Link
                  href={`/c/${c.id}`}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg py-2.5 pr-8 pl-3 text-sm transition-colors hover:bg-sidebar-accent",
                    c.id === activeId
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70"
                  )}
                >
                  <MessageSquare className="size-3.5 shrink-0" />
                  <span className="truncate">{c.title}</span>
                </Link>
                <button
                  type="button"
                  aria-label="Delete conversation"
                  onClick={() => handleDelete(c.id)}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 cursor-pointer rounded-md p-1 text-sidebar-foreground/50 opacity-0 transition-opacity hover:bg-background hover:text-destructive group-hover/item:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  const collapsedRail = (
    <div className="flex h-full w-full flex-col items-center">
      <div className="flex w-full flex-col items-center gap-2 border-b border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Expand sidebar"
          onClick={() => setCollapsed(false)}
        >
          <PanelLeftOpen className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="New chat"
          onClick={handleNewChat}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
          collapsed ? "w-14" : "w-64"
        )}
      >
        {collapsed ? collapsedRail : expandedContent}
      </aside>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-72 bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Conversations</SheetTitle>
          {expandedContent}
        </SheetContent>
      </Sheet>
    </>
  )
}
