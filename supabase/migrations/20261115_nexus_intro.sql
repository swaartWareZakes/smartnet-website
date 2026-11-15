begin;

alter table public.nexus_conversations
  add column if not exists visitor_name
    text not null default ''
    check (length(visitor_name) <= 160),
  add column if not exists company_profile
    text not null default ''
    check (length(company_profile) <= 2000);

commit;
