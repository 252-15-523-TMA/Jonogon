-- Optional, account-linked citizen chat history. Each signed-in user can access only their own conversations.
create table if not exists public.citizen_chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  messages jsonb not null default '[]'::jsonb check (jsonb_typeof(messages) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists citizen_chat_conversations_user_updated_idx
  on public.citizen_chat_conversations (user_id, updated_at desc);

alter table public.citizen_chat_conversations enable row level security;

revoke all on public.citizen_chat_conversations from anon, authenticated;
grant select, insert, update, delete on public.citizen_chat_conversations to authenticated;

drop policy if exists "Users read their own citizen chats" on public.citizen_chat_conversations;
create policy "Users read their own citizen chats"
  on public.citizen_chat_conversations for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users create their own citizen chats" on public.citizen_chat_conversations;
create policy "Users create their own citizen chats"
  on public.citizen_chat_conversations for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users update their own citizen chats" on public.citizen_chat_conversations;
create policy "Users update their own citizen chats"
  on public.citizen_chat_conversations for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users delete their own citizen chats" on public.citizen_chat_conversations;
create policy "Users delete their own citizen chats"
  on public.citizen_chat_conversations for delete to authenticated
  using ((select auth.uid()) = user_id);
