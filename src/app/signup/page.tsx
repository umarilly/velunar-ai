import { redirect } from "next/navigation"
import { Sparkles } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { AuthForm } from "@/components/auth/auth-form"
import { APP_NAME } from "@/lib/chat-config"

export default async function SignupPage() {
  const supabase = await createClient()
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) redirect("/")
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Create your {APP_NAME} account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save your chat history across sessions and devices.
          </p>
        </div>

        <AuthForm variant="signup" />
      </div>
    </div>
  )
}
