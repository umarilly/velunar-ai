"use client"

import type { User } from "@supabase/supabase-js"
import { PanelLeft, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/auth/user-menu"
import { APP_NAME } from "@/lib/chat-config"

interface ChatHeaderProps {
  user: User | null
  onOpenSidebar: () => void
}

export function ChatHeader({ user, onOpenSidebar }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/80 px-3 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open sidebar"
          className="md:hidden"
          onClick={onOpenSidebar}
        >
          <PanelLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2 pl-1">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="font-heading text-base font-semibold tracking-tight">
            {APP_NAME}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  )
}
