import { notFound, redirect } from "next/navigation"
import type { UIMessage } from "ai"

import { ChatShell } from "@/components/chat/chat-shell"
import { createClient } from "@/lib/supabase/server"

interface ConversationPageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params

  const supabase = await createClient()
  if (!supabase) redirect("/")

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/")

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", id)
    .maybeSingle()
  if (!conversation) notFound()

  const { data: rows } = await supabase
    .from("messages")
    .select("id,role,parts")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })

  const initialMessages: UIMessage[] = (rows ?? []).map((row) => ({
    id: row.id,
    role: row.role,
    parts: row.parts as UIMessage["parts"],
  }))

  return (
    <ChatShell
      key={id}
      user={user}
      conversationId={id}
      initialMessages={initialMessages}
    />
  )
}
