create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  risk_style text not null default 'balanced' check (risk_style in ('conservative','balanced','aggressive')),
  time_horizon text not null default 'long-term',
  experience_level text not null default 'intermediate' check (experience_level in ('beginner','intermediate','advanced')),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null check (symbol ~ '^[A-Z0-9.:-]{1,15}$'),
  company_name text,
  thesis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, symbol)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New research thread',
  surface text not null default 'web' check (surface in ('web','extension')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null check (char_length(content) <= 30000),
  citations jsonb not null default '[]'::jsonb,
  page_context jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.memory_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('symbol','analysis_style','time_horizon','risk_preference')),
  key text not null,
  value jsonb not null default '{}'::jsonb,
  confidence real not null default 0.5 check (confidence between 0 and 1),
  observation_count integer not null default 1 check (observation_count > 0),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, kind, key)
);

create table if not exists public.page_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  origin text not null,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, origin)
);

create index if not exists conversations_user_updated_idx on public.conversations(user_id, updated_at desc);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists memory_signals_user_seen_idx on public.memory_signals(user_id, last_seen_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists watchlist_set_updated_at on public.watchlist_items;
create trigger watchlist_set_updated_at before update on public.watchlist_items for each row execute function public.set_updated_at();
drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at before update on public.conversations for each row execute function public.set_updated_at();
drop trigger if exists page_permissions_set_updated_at on public.page_permissions;
create trigger page_permissions_set_updated_at before update on public.page_permissions for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.memory_signals enable row level security;
alter table public.page_permissions enable row level security;

create policy "profiles_owner_all" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "watchlist_owner_all" on public.watchlist_items for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "conversations_owner_all" on public.conversations for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "messages_owner_all" on public.messages for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "memory_owner_all" on public.memory_signals for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "permissions_owner_all" on public.page_permissions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.profiles, public.watchlist_items, public.conversations, public.messages, public.memory_signals, public.page_permissions from anon;
grant select, insert, update, delete on public.profiles, public.watchlist_items, public.conversations, public.messages, public.memory_signals, public.page_permissions to authenticated;
