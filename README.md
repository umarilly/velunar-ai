# Velunar AI

A modern, streaming AI chat assistant — a full-stack Next.js app powered by a real LLM.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **AI SDK** (`ai`, `@ai-sdk/google`, `@ai-sdk/groq`, `@ai-sdk/react`) — streaming chat via Gemini (default) or Groq
- **Supabase** (`@supabase/ssr`) — auth (email/password, magic link, Google/GitHub OAuth) and Postgres for saved chat history + rate limiting
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives) — component system
- **Framer Motion** — message and UI animation
- **next-themes** — light/dark mode
- **react-markdown** + **remark-gfm** + Tailwind Typography — rendered assistant responses

## Architecture

- `src/app/api/chat/route.ts` — the streaming Route Handler. Rate-limits the request, picks a model (Gemini by default, Groq as a free fallback), persists the user + assistant messages for signed-in users, calls `streamText`, and returns a UI message stream response consumed directly by the client.
- `src/components/chat/chat-shell.tsx` — the client component that owns one conversation via `useChat` (from `@ai-sdk/react`): send/stop, auto-scroll, and updating the URL to `/c/[id]` on the first message without remounting.
- `src/app/page.tsx` — a fresh, unsaved chat (works with no sign-in — a brand new conversation id is minted server-side on every load).
- `src/app/c/[id]/page.tsx` — loads a saved conversation's messages (owner-only, enforced by Postgres RLS) and hands them to `ChatShell` as `initialMessages`.
- `src/components/chat/conversation-sidebar.tsx` — the chat history list (desktop rail + mobile sheet), reading straight from Supabase via the browser client, protected by RLS.
- `src/lib/supabase/{client,server}.ts` — Supabase client factories for the browser and for Server Components/Route Handlers; both return `null` when Supabase env vars aren't set, so the app degrades gracefully to the original no-auth, no-persistence experience.
- `src/proxy.ts` — refreshes the Supabase session cookie on every request (Next.js 16's renamed `middleware.ts`).
- `supabase/schema.sql` — the whole Postgres schema: `conversations` + `messages` tables with RLS so users can only ever read/write their own rows, and a `check_rate_limit` function used for per-user/per-IP daily message caps.
- `src/components/ui/*` — shadcn/ui primitives.
- `src/app/globals.css` — the design system: a warm neutral (stone) palette with a single terracotta accent, as CSS variables (light + dark), mapped into Tailwind's `@theme`.

Signing in is optional everywhere — an anonymous visitor gets the exact same chat experience as before, just without saved history, and is rate-limited by IP instead of by account.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the keys below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 1. An AI provider (required)

Both have free tiers with no billing risk — requests are throttled/rejected once you hit the quota, never charged:

- **Gemini** (used by default when set): [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **Groq** (used if `GEMINI_API_KEY` isn't set, or if `AI_PROVIDER=groq`): [console.groq.com/keys](https://console.groq.com/keys)

### 2. Supabase (optional — enables sign-in + saved history)

1. Create a free project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Settings → API → copy the **Project URL** and **anon public** key into `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. SQL Editor → paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) → Run. This creates the tables, RLS policies, and the rate-limit function.
4. Authentication → URL Configuration → set **Site URL** to your app's URL (`http://localhost:3000` locally, your Vercel URL in production), and add `.../auth/callback` under **Redirect URLs** for each environment.
5. For Google/GitHub sign-in: Authentication → Providers → enable Google/GitHub and paste in the OAuth client ID/secret from each provider's own developer console (redirect URI they'll ask for is `https://<your-project>.supabase.co/auth/v1/callback`). Skip this step and the buttons simply won't complete — email/password and magic link work without it.

Without Supabase configured, the app runs exactly as before: no sign-in button state, no history, no DB-backed rate limit.

## Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm start` — run the production build
- `npm run lint` — ESLint

## Deploying to Vercel

Import the repo in Vercel and add the same environment variables from `.env.example`. The app is a single Next.js project — `/api/chat`, `/auth/callback`, etc. all deploy as serverless functions automatically; there's no separate backend to stand up.
