begin;

create table if not exists public.nexus_session_logs (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  channel text not null default 'voice' check (channel in ('voice', 'text', 'mixed')),
  status text not null default 'browsing'
    check (status in ('browsing', 'engaged', 'researched', 'lead_captured')),
  lead_score integer not null default 0 check (lead_score between 0 and 100),
  company_name text not null default '' check (length(company_name) <= 160),
  company_website text not null default '' check (length(company_website) <= 250),
  research_summary text not null default '' check (length(research_summary) <= 8000),
  research_sources jsonb not null default '[]'::jsonb
    check (jsonb_typeof(research_sources) = 'array' and octet_length(research_sources::text) <= 25000),
  enquiry_id uuid null references public.nexus_enquiries(id) on delete set null,
  visitor_name text not null default '' check (length(visitor_name) <= 160),
  visitor_email text not null default '' check (length(visitor_email) <= 254),
  visitor_phone text not null default '' check (length(visitor_phone) <= 40),
  ip_address text not null default '' check (length(ip_address) <= 80),
  city text not null default '' check (length(city) <= 120),
  region text not null default '' check (length(region) <= 120),
  country_code text not null default '' check (length(country_code) <= 12),
  country_name text not null default '' check (length(country_name) <= 120),
  timezone text not null default '' check (length(timezone) <= 80),
  user_agent text not null default '' check (length(user_agent) <= 300),
  page_path text not null default '' check (length(page_path) <= 200),
  message_count integer not null default 0 check (message_count >= 0),
  messages jsonb not null default '[]'::jsonb
    check (jsonb_typeof(messages) = 'array' and octet_length(messages::text) <= 180000),
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

create index if not exists nexus_session_logs_lead_sort
  on public.nexus_session_logs(lead_score desc, last_activity_at desc);

create index if not exists nexus_session_logs_status_recent
  on public.nexus_session_logs(status, last_activity_at desc);

create index if not exists nexus_session_logs_owner
  on public.nexus_session_logs(user_id, last_activity_at desc);

alter table public.nexus_session_logs enable row level security;

revoke all on public.nexus_session_logs from anon, authenticated;
grant select, insert, update on public.nexus_session_logs to authenticated;

drop policy if exists nexus_session_logs_read on public.nexus_session_logs;
drop policy if exists nexus_session_logs_insert on public.nexus_session_logs;
drop policy if exists nexus_session_logs_update on public.nexus_session_logs;

create policy nexus_session_logs_read
  on public.nexus_session_logs
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy nexus_session_logs_insert
  on public.nexus_session_logs
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy nexus_session_logs_update
  on public.nexus_session_logs
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Also store IP, location, and session_log_id directly on enquiries
alter table public.nexus_enquiries
  add column if not exists session_log_id uuid null references public.nexus_session_logs(id) on delete set null,
  add column if not exists ip_address text not null default '' check (length(ip_address) <= 80),
  add column if not exists city text not null default '' check (length(city) <= 120),
  add column if not exists region text not null default '' check (length(region) <= 120),
  add column if not exists country_name text not null default '' check (length(country_name) <= 120);

-- Lead sorting view for quick inspection in Supabase Dashboard / Kairo Studio
create or replace view public.nexus_lead_inbox as
select
  id,
  status,
  lead_score,
  company_name,
  company_website,
  visitor_name,
  visitor_email,
  visitor_phone,
  enquiry_id,
  message_count,
  trim(both ', ' from concat_ws(', ', nullif(city, ''), nullif(region, ''), nullif(country_name, ''))) as location,
  ip_address,
  channel,
  started_at,
  last_activity_at,
  messages
from public.nexus_session_logs
order by lead_score desc, last_activity_at desc;

commit;
