-- Velunar AI — Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- ─────────────────────────────────────────────────────────────────────────
-- Conversations + messages (chat history, per user)
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_id_updated_at_idx
  on public.conversations (user_id, updated_at desc);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  parts jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at asc);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Users select own conversations" on public.conversations
  for select using (auth.uid() = user_id);
create policy "Users insert own conversations" on public.conversations
  for insert with check (auth.uid() = user_id);
create policy "Users update own conversations" on public.conversations
  for update using (auth.uid() = user_id);
create policy "Users delete own conversations" on public.conversations
  for delete using (auth.uid() = user_id);

create policy "Users select own messages" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );
create policy "Users insert own messages" on public.messages
  for insert with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );
create policy "Users delete own messages" on public.messages
  for delete using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

-- Keep a conversation's updated_at (and therefore its sidebar position) fresh
-- whenever a new message is appended to it.
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- ─────────────────────────────────────────────────────────────────────────
-- Rate limiting (per user, or per IP for anonymous visitors)
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.rate_limits (
  identifier text primary key,
  count int not null default 0,
  window_start timestamptz not null default now()
);

-- Atomically increments the counter for `p_identifier` and reports whether
-- it's still within `p_limit` for the current rolling `p_window_minutes`
-- window. Runs as security definer so both anonymous and signed-in clients
-- can call it via RPC without needing direct table access.
create or replace function public.check_rate_limit(
  p_identifier text,
  p_limit int,
  p_window_minutes int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.rate_limits (identifier, count, window_start)
  values (p_identifier, 1, now())
  on conflict (identifier) do update
    set count = case
          when public.rate_limits.window_start < now() - (p_window_minutes || ' minutes')::interval
            then 1
          else public.rate_limits.count + 1
        end,
        window_start = case
          when public.rate_limits.window_start < now() - (p_window_minutes || ' minutes')::interval
            then now()
          else public.rate_limits.window_start
        end
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on public.rate_limits from anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to anon, authenticated;
