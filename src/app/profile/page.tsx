import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/auth/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  if (!supabase) redirect("/")

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to chat
      </Link>

      <h1 className="font-heading text-xl font-semibold tracking-tight">
        Profile
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Manage your account details.
      </p>

      <ProfileForm user={user} />
    </div>
  )
}
