"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { PRESET_AVATARS } from "@/components/auth/preset-avatars"

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter()

  const [fullName, setFullName] = useState(
    (user.user_metadata?.full_name as string | undefined) ?? ""
  )
  const [email, setEmail] = useState(user.email ?? "")
  const [savingProfile, setSavingProfile] = useState(false)

  const [avatarId, setAvatarId] = useState(
    (user.user_metadata?.avatar_id as string | undefined) ?? ""
  )
  const [savingAvatar, setSavingAvatar] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    if (!supabase) return

    setSavingProfile(true)
    const emailChanged = email.trim() !== (user.email ?? "")
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim() },
      ...(emailChanged ? { email: email.trim() } : {}),
    })
    setSavingProfile(false)

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(
      emailChanged
        ? "Profile updated. Check your new email to confirm the change."
        : "Profile updated."
    )
    router.refresh()
  }

  async function handleSelectAvatar(id: string) {
    if (id === avatarId || savingAvatar) return
    const supabase = createClient()
    if (!supabase) return

    setSavingAvatar(true)
    const previous = avatarId
    setAvatarId(id)
    const { error } = await supabase.auth.updateUser({ data: { avatar_id: id } })
    setSavingAvatar(false)

    if (error) {
      setAvatarId(previous)
      toast.error(error.message)
      return
    }
    router.refresh()
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    if (!supabase || !user.email) return

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords don't match.")
      return
    }

    setSavingPassword(true)

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (verifyError) {
      setSavingPassword(false)
      toast.error("Current password is incorrect.")
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)

    if (error) {
      toast.error(error.message)
      return
    }
    setCurrentPassword("")
    setNewPassword("")
    setConfirmNewPassword("")
    toast.success("Password updated.")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="font-heading text-sm font-semibold">Avatar</h2>
        <div className="flex gap-3">
          {PRESET_AVATARS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={`Use the ${label} avatar`}
              aria-pressed={avatarId === id}
              disabled={savingAvatar}
              onClick={() => handleSelectAvatar(id)}
              className={cn(
                "size-11 shrink-0 overflow-hidden rounded-full transition-shadow disabled:opacity-60",
                avatarId === id
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <Icon className="size-full" />
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleProfileSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
      >
        <h2 className="font-heading text-sm font-semibold">Profile info</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-full-name">Full name</Label>
          <Input
            id="profile-full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" className="mt-1 w-fit" disabled={savingProfile}>
          {savingProfile && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
      >
        <h2 className="font-heading text-sm font-semibold">Change password</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-new-password">Confirm new password</Label>
          <Input
            id="confirm-new-password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="mt-1 w-fit" disabled={savingPassword}>
          {savingPassword && <Loader2 className="size-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </div>
  )
}
