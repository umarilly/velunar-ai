"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail } from "lucide-react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GoogleIcon } from "@/components/auth/google-icon"
import { GithubIcon } from "@/components/auth/github-icon"

type Variant = "signin" | "signup"
type Mode = "password" | "magic-link"
type Busy = "password" | "magic-link" | "google" | "github" | null

export function AuthForm({ variant }: { variant: Variant }) {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>("password")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [busy, setBusy] = useState<Busy>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  if (!supabase) {
    return (
      <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        Auth isn&apos;t configured yet — add{" "}
        <code className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-xs">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        and{" "}
        <code className="rounded bg-foreground/10 px-1 py-0.5 font-mono text-xs">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        to your environment.
      </p>
    )
  }

  const origin = typeof window !== "undefined" ? window.location.origin : ""

  async function handlePassword(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    if (variant === "signup" && password !== confirmPassword) {
      toast.error("Passwords don't match.")
      return
    }

    setBusy("password")

    if (variant === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setBusy(null)
      if (error) {
        toast.error(error.message)
        return
      }
      router.push("/")
      router.refresh()
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })
    setBusy(null)

    if (error) {
      toast.error(error.message)
      return
    }

    // Never leave the user signed in straight after signup — if email
    // confirmation is disabled, signUp() returns an active session, so sign
    // it back out and send them to /login to sign in explicitly instead.
    if (data.session) {
      await supabase.auth.signOut()
      toast.success("Account created! Please sign in.")
    } else {
      toast.success("Account created! Check your email to confirm it, then sign in.")
    }
    router.push("/login")
    router.refresh()
  }

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setBusy("magic-link")
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    })
    setBusy(null)

    if (error) {
      toast.error(error.message)
      return
    }
    setMagicLinkSent(true)
  }

  async function handleOAuth(provider: "google" | "github") {
    if (!supabase) return
    setBusy(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/auth/callback` },
    })
    if (error) {
      toast.error(error.message)
      setBusy(null)
    }
    // On success the browser navigates away to the provider — nothing else to do.
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={busy !== null}
          onClick={() => handleOAuth("google")}
        >
          {busy === "google" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleIcon className="size-4" />
          )}
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy !== null}
          onClick={() => handleOAuth("github")}
        >
          {busy === "github" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GithubIcon className="size-4" />
          )}
          GitHub
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      {mode === "password" ? (
        <form className="flex flex-col gap-3" onSubmit={handlePassword}>
          {variant === "signup" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full-name">Full name</Label>
              <Input
                id="full-name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={variant === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {variant === "signup" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <Button type="submit" className="mt-1" disabled={busy !== null}>
            {busy === "password" && <Loader2 className="size-4 animate-spin" />}
            {variant === "signin" ? "Sign in" : "Create account"}
          </Button>

          <button
            type="button"
            className="cursor-pointer text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setMode("magic-link")}
          >
            Use a magic link instead
          </button>
        </form>
      ) : magicLinkSent ? (
        <p className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm text-muted-foreground">
          Check <span className="font-medium text-foreground">{email}</span> for a
          sign-in link.
        </p>
      ) : (
        <form className="flex flex-col gap-3" onSubmit={handleMagicLink}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="magic-email">Email</Label>
            <Input
              id="magic-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={busy !== null}>
            {busy === "magic-link" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Mail className="size-4" />
            )}
            Send magic link
          </Button>

          <button
            type="button"
            className="cursor-pointer text-center text-xs text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setMode("password")}
          >
            Use a password instead
          </button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {variant === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
