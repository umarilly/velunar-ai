"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { LogOut, UserRound } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PresetAvatarIcon } from "@/components/auth/preset-avatars"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu({ user }: { user: User | null }) {
  const router = useRouter()

  if (!user) {
    return (
      <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
        Sign in
      </Button>
    )
  }

  const fullName = user.user_metadata?.full_name as string | undefined
  const avatarId = user.user_metadata?.avatar_id as string | undefined
  const initials = fullName
    ? fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : (user.email ?? "?").slice(0, 2).toUpperCase()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase?.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Account menu"
            className="rounded-full"
          >
            <Avatar size="sm">
              {avatarId ? (
                <PresetAvatarIcon id={avatarId} className="size-full" />
              ) : (
                <>
                  <AvatarImage
                    src={user.user_metadata?.avatar_url as string | undefined}
                    alt=""
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </>
              )}
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
            {fullName && (
              <span className="max-w-48 truncate text-sm font-medium text-foreground">
                {fullName}
              </span>
            )}
            <span className="max-w-48 truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <UserRound className="size-4" />
          Edit profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
