begin;

create table if not exists public.nexus_enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  idempotency_key uuid not null,
  conversation_id uuid null,
  visitor_name text not null check (length(trim(visitor_name)) between 1 and 160),
  email text not null check (length(trim(email)) between 3 and 254),
  phone text not null default '' check (length(phone) <= 40),
  company_name text not null default '' check (length(company_name) <= 160),
  company_website text not null default '' check (length(company_website) <= 250),
  preferred_contact text not null check (preferred_contact in ('email', 'phone')),
  summary text not null check (length(trim(summary)) between 1 and 2000),
  research_links jsonb not null default '[]'::jsonb
    check (jsonb_typeof(research_links) = 'array' and octet_length(research_links::text) <= 20000),
  contact_consent boolean not null check (contact_consent = true),
  contact_consent_version text not null check (contact_consent_version = '2026-11-19'),
  contact_consent_at timestamptz not null default now(),
  marketing_opt_in boolean not null default false check (marketing_opt_in = false),
  save_transcript_consent boolean not null default false,
  transcript jsonb null
    check (
      (save_transcript_consent = false and transcript is null) or
      (save_transcript_consent = true and transcript is not null and jsonb_typeof(transcript) = 'array' and octet_length(transcript::text) <= 120000)
    ),
  status text not null default 'New enquiry'
    check (status in ('New enquiry', 'Contacted', 'Scheduled', 'Closed')),
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sent', 'skipped', 'failed')),
  notified_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint nexus_enquiries_phone_required
    check (preferred_contact <> 'phone' or length(trim(phone)) >= 7),
  unique (user_id, idempotency_key),
  foreign key (conversation_id, user_id)
    references public.nexus_conversations(id, user_id)
    on delete set null (conversation_id)
);

create index if not exists nexus_enquiries_status_created
  on public.nexus_enquiries(status, created_at desc);

create index if not exists nexus_enquiries_owner
  on public.nexus_enquiries(user_id, created_at desc);

alter table public.nexus_enquiries enable row level security;

revoke all on public.nexus_enquiries from anon, authenticated;
grant select, insert on public.nexus_enquiries to authenticated;

drop policy if exists nexus_enquiries_read on public.nexus_enquiries;
drop policy if exists nexus_enquiries_create on public.nexus_enquiries;

create policy nexus_enquiries_read
  on public.nexus_enquiries
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy nexus_enquiries_create
  on public.nexus_enquiries
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create or replace function public.nexus_take_request(p_kind text) returns boolean
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
    when 'enquiry' then personal_limit := 5; global_limit := 200;
    else return false;
  end case;
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
