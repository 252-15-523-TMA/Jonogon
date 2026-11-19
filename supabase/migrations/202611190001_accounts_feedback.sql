-- Run this migration in the Supabase SQL editor or with the Supabase CLI.
-- All profile and feedback data is protected by RLS; only a trusted Supabase project admin can assign the owner role.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nickname text not null default '',
  full_name text not null default '',
  avatar_url text,
  role text not null default 'citizen' check (role in ('citizen', 'owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sender_email text not null,
  message text not null check (char_length(message) between 10 and 5000),
  status text not null default 'new' check (status in ('new', 'answered')),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  feedback_id uuid references public.feedback (id) on delete set null,
  title text not null,
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  created_by uuid not null references auth.users (id)
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_user_id_idx on public.feedback (user_id);
create index if not exists notifications_user_read_idx on public.notifications (user_id, read_at, created_at desc);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email, nickname)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'nickname', ''), split_part(new.email, '@', 1))
  )
  on conflict (user_id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create or replace function public.is_site_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = (select auth.uid())
      and p.role = 'owner'
  );
$$;

revoke all on function public.is_site_owner() from public;
grant execute on function public.is_site_owner() to authenticated;

alter table public.profiles enable row level security;
alter table public.feedback enable row level security;
alter table public.notifications enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.feedback from anon, authenticated;
revoke all on public.notifications from anon, authenticated;

grant select on public.profiles to authenticated;
grant insert (user_id, email, nickname, full_name, avatar_url) on public.profiles to authenticated;
grant update (nickname, full_name, avatar_url) on public.profiles to authenticated;
grant select on public.feedback to authenticated;
grant insert (user_id, sender_email, message) on public.feedback to authenticated;
grant update (status) on public.feedback to authenticated;
grant select, insert on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

drop policy if exists "Users and owner read profiles" on public.profiles;
create policy "Users and owner read profiles"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id or (select public.is_site_owner()));

drop policy if exists "Users create their profile" on public.profiles;
create policy "Users create their profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id and role = 'citizen');

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users submit feedback as themselves" on public.feedback;
create policy "Users submit feedback as themselves"
  on public.feedback for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users and owner read feedback" on public.feedback;
create policy "Users and owner read feedback"
  on public.feedback for select to authenticated
  using ((select auth.uid()) = user_id or (select public.is_site_owner()));

drop policy if exists "Owner marks feedback answered" on public.feedback;
create policy "Owner marks feedback answered"
  on public.feedback for update to authenticated
  using ((select public.is_site_owner()))
  with check ((select public.is_site_owner()));

drop policy if exists "Users and owner read notifications" on public.notifications;
create policy "Users and owner read notifications"
  on public.notifications for select to authenticated
  using ((select auth.uid()) = user_id or (select public.is_site_owner()));

drop policy if exists "Owner sends notifications" on public.notifications;
create policy "Owner sends notifications"
  on public.notifications for insert to authenticated
  with check ((select public.is_site_owner()) and (select auth.uid()) = created_by);

drop policy if exists "Users mark their notifications read" on public.notifications;
create policy "Users mark their notifications read"
  on public.notifications for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists "Users upload their own avatar" on storage.objects;
create policy "Users upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users update their own avatar" on storage.objects;
create policy "Users update their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- After your first owner account signs up and confirms its email, assign its email here in the SQL editor:
-- update public.profiles set role = 'owner' where email = 'your-owner-email@example.com';
