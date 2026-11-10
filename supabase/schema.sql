-- Rasl Estate office database (Supabase / Postgres). Applied to project uejkzdpyvlaxjziknzuy.
-- One office = one brokerage. Members sign in with email and password. Every app record is a row in `records`.

create table public.offices (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  code text not null unique,
  created_by uuid not null default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.members (
  office_id uuid not null references public.offices (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default '',
  role text not null default 'agent' check (role in ('owner', 'agent')),
  joined_at timestamptz not null default now(),
  primary key (office_id, user_id)
);
create index members_user_idx on public.members (user_id);

create table public.records (
  office_id uuid not null references public.offices (id) on delete cascade,
  coll text not null check (coll in ('agents','properties','leads','deals','appointments','campaigns','donations','referrals','settings')),
  id text not null check (char_length(id) between 1 and 64),
  data jsonb not null,
  deleted boolean not null default false,          -- tombstone, so deletions reach teammates through the live feed
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (office_id, coll, id)
);
create index records_office_updated_idx on public.records (office_id, updated_at);

create or replace function public.touch_record() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end $$;
create trigger records_touch before insert or update on public.records for each row execute function public.touch_record();

create schema if not exists private;
grant usage on schema private to authenticated;
create or replace function private.is_member(o uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members m where m.office_id = o and m.user_id = (select auth.uid()));
$$;
revoke all on function private.is_member(uuid) from public, anon;
grant execute on function private.is_member(uuid) to authenticated;

alter table public.offices enable row level security;
alter table public.members enable row level security;
alter table public.records enable row level security;

create policy "members read their office" on public.offices for select to authenticated using (private.is_member(id));
create policy "owner renames office" on public.offices for update to authenticated
  using (exists (select 1 from public.members m where m.office_id = id and m.user_id = (select auth.uid()) and m.role = 'owner')) with check (true);
create policy "members see each other" on public.members for select to authenticated using (private.is_member(office_id));
create policy "member updates own name" on public.members for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "member leaves office" on public.members for delete to authenticated using (user_id = (select auth.uid()));
create policy "members read records" on public.records for select to authenticated using (private.is_member(office_id));
create policy "members add records" on public.records for insert to authenticated with check (private.is_member(office_id));
create policy "members change records" on public.records for update to authenticated using (private.is_member(office_id)) with check (private.is_member(office_id));
create policy "members remove records" on public.records for delete to authenticated using (private.is_member(office_id));

-- create_office(name, member_name) and join_office(code, member_name): security definer functions,
-- the only way to become a member. See the migration "office_records" for their bodies.

grant select, update on public.offices to authenticated;
grant select, update, delete on public.members to authenticated;
grant select, insert, update, delete on public.records to authenticated;
alter publication supabase_realtime add table public.records;
