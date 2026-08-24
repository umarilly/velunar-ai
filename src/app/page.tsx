import { ChatShell } from "@/components/chat/chat-shell"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const user = supabase ? (await supabase.auth.getUser()).data.user : null
  const conversationId = crypto.randomUUID()

  return (
    <ChatShell
      key={conversationId}
      user={user}
      conversationId={conversationId}
      initialMessages={[]}
    />
  )
}
