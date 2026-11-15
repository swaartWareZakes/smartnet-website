begin;
create table public.nexus_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  company text not null check (length(company) between 1 and 160),
  email text not null check (length(email) between 3 and 254),
  website text not null default '' check (length(website) <= 250),
  consent_version text not null check (consent_version = '2026-11-15'),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
create table public.nexus_messages (
  id uuid primary key,
  conversation_id uuid not null,
  user_id uuid not null default auth.uid(),
  role text not null check (role in ('user', 'assistant')),
  content text not null check (length(content) between 1 and 20000),
  channel text not null check (channel in ('text', 'voice')),
  created_at timestamptz not null default now(),
  foreign key (conversation_id, user_id) references public.nexus_conversations(id, user_id) on delete cascade
);
create table public.nexus_research (
  conversation_id uuid primary key,
  user_id uuid not null default auth.uid(),
  report jsonb not null check (octet_length(report::text) <= 150000),
  foreign key (conversation_id, user_id) references public.nexus_conversations(id, user_id) on delete cascade
);
create index nexus_conversations_owner on public.nexus_conversations(user_id, created_at desc);
create index nexus_messages_history on public.nexus_messages(conversation_id, created_at);
alter table public.nexus_conversations enable row level security;
alter table public.nexus_messages enable row level security;
alter table public.nexus_research enable row level security;
revoke all on public.nexus_conversations, public.nexus_messages, public.nexus_research from anon, authenticated;
grant select, insert, delete on public.nexus_conversations to authenticated;
grant select, insert on public.nexus_messages to authenticated;
grant select, insert, update on public.nexus_research to authenticated;
create policy nexus_conversations_read on public.nexus_conversations for select to authenticated using (user_id = (select auth.uid()));
create policy nexus_conversations_create on public.nexus_conversations for insert to authenticated with check (user_id = (select auth.uid()));
create policy nexus_conversations_delete on public.nexus_conversations for delete to authenticated using (user_id = (select auth.uid()));
create policy nexus_messages_read on public.nexus_messages for select to authenticated using (user_id = (select auth.uid()));
create policy nexus_messages_create on public.nexus_messages for insert to authenticated with check (user_id = (select auth.uid()));
create policy nexus_research_owner on public.nexus_research for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Fixed daily request budgets. No credentials and no transcript content in this table.
create schema if not exists nexus_private;
revoke all on schema nexus_private from public, anon, authenticated;
create table nexus_private.request_budgets (
  subject text not null,
  kind text not null,
  day date not null,
  used integer not null,
  primary key (subject, kind, day)
);
create function public.nexus_take_request(p_kind text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  visitor uuid := auth.uid();
  today date := (now() at time zone 'UTC')::date;
  personal_limit integer;
  global_limit integer;
  n integer;
begin
  if visitor is null then return false; end if;
  case p_kind
    when 'research' then personal_limit := 4; global_limit := 100;
    when 'chat' then personal_limit := 60; global_limit := 2000;
    when 'live' then personal_limit := 6; global_limit := 100;
    else return false;
  end case;
  -- Serialize budget updates across visitors to enforce the shared daily ceiling.
  perform pg_advisory_xact_lock(73412026);
  delete from nexus_private.request_budgets where day < today - 7;
  select used into n from nexus_private.request_budgets where subject = '*' and kind = p_kind and day = today;
  if coalesce(n, 0) >= global_limit then return false; end if;
  select used into n from nexus_private.request_budgets where subject = visitor::text and kind = p_kind and day = today;
  if coalesce(n, 0) >= personal_limit then return false; end if;
  insert into nexus_private.request_budgets values ('*', p_kind, today, 1), (visitor::text, p_kind, today, 1)
  on conflict (subject, kind, day) do update set used = nexus_private.request_budgets.used + 1;
  return true;
end $$;
revoke all on function public.nexus_take_request(text) from public, anon;
grant execute on function public.nexus_take_request(text) to authenticated;
commit;
