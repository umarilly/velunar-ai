import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { groq } from "@ai-sdk/groq"
import { convertToModelMessages, streamText, type LanguageModel, type UIMessage } from "ai"

import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

const SYSTEM_PROMPT = `You are Velunar, a warm, sharp, and concise AI assistant embedded in a web chat app.

Guidelines:
- Be genuinely helpful and get to the point; avoid filler and unnecessary caveats.
- Use Markdown when it aids clarity (short lists, code blocks with language tags, **bold** for key terms) but don't over-format simple answers.
- If a request is ambiguous, make a reasonable assumption and say what you assumed, rather than stalling with questions.
- Keep responses proportional to the question: quick answers for quick questions, depth when it's actually asked for.`

const ANONYMOUS_LIMIT_PER_DAY = Number(process.env.RATE_LIMIT_ANONYMOUS_PER_DAY) || 5
const AUTHENTICATED_LIMIT_PER_DAY = Number(process.env.RATE_LIMIT_AUTHENTICATED_PER_DAY) || 15
const WINDOW_MINUTES = 24 * 60

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })

function getModel(): LanguageModel {
  const provider =
    process.env.AI_PROVIDER ||
    (process.env.GEMINI_API_KEY ? "gemini" : "groq")

  if (provider === "groq") {
    return groq(process.env.GROQ_MODEL || "llama-3.3-70b-versatile")
  }
  return google(process.env.GEMINI_MODEL || "gemini-3.6-flash")
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for")
  return forwardedFor?.split(",")[0]?.trim() || "unknown"
}

function deriveTitle(message: UIMessage): string {
  const text = message.parts
    .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join(" ")
    .trim()
  return text.length > 60 ? `${text.slice(0, 60)}…` : text || "New chat"
}

export async function POST(req: Request) {
  const {
    messages,
    conversationId,
  }: { messages: UIMessage[]; conversationId?: string } = await req.json()

  const supabase = await createClient()
  const user = supabase ? (await supabase.auth.getUser()).data.user : null

  if (supabase) {
    const identifier = user ? `user:${user.id}` : `ip:${getClientIp(req)}`
    const limit = user ? AUTHENTICATED_LIMIT_PER_DAY : ANONYMOUS_LIMIT_PER_DAY

    const { data: allowed, error: rateLimitError } = await supabase.rpc(
      "check_rate_limit",
      { p_identifier: identifier, p_limit: limit, p_window_minutes: WINDOW_MINUTES }
    )

    if (!rateLimitError && allowed === false) {
      return new Response(
        `Daily message limit reached (${limit}/day).${user ? "" : " Sign in for a higher limit."} Try again tomorrow.`,
        { status: 429 }
      )
    }
  }

  const latestMessage = messages[messages.length - 1]

  if (supabase && user && conversationId && latestMessage?.role === "user") {
    await supabase
      .from("conversations")
      .upsert(
        { id: conversationId, user_id: user.id, title: deriveTitle(latestMessage) },
        { onConflict: "id", ignoreDuplicates: true }
      )
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      parts: latestMessage.parts,
    })
  }

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 2048,
    onFinish: async ({ text }) => {
      if (supabase && user && conversationId && text) {
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          role: "assistant",
          parts: [{ type: "text", text }],
        })
      }
    },
  })

  return result.toUIMessageStreamResponse()
}
