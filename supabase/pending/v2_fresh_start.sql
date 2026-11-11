-- Rasl Estate v2: fresh start. Paste into the Supabase SQL editor and press Run.
-- ===================== Fresh start: remove the first version =====================
drop policy if exists "office members upload project media" on storage.objects;
drop policy if exists "office members replace project media" on storage.objects;
drop policy if exists "office members delete project media" on storage.objects;
drop function if exists public.get_public_project(uuid, text);
drop function if exists public.submit_interest(uuid, text, text, text, text, text);
drop function if exists public.create_office(text, text);
drop function if exists public.join_office(text, text);
drop table if exists public.records cascade;
drop table if exists public.members cascade;
drop table if exists public.offices cascade;
drop function if exists public.touch_record() cascade;
drop function if exists private.is_member(uuid);
delete from auth.users where email like '%@rasl-test.invalid';

-- ===================== Rasl Estate v2 =====================
create schema if not exists private;
grant usage on schema private to authenticated, anon;

create table public.members (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 40),
  father_name text not null check (char_length(father_name) between 1 and 40),
  grandfather_name text not null check (char_length(grandfather_name) between 1 and 40),
  email text not null default '',
  phone text not null unique check (char_length(phone) between 7 and 20),
  code text not null unique check (code ~ '^[A-Z0-9]{4,16}$'),
  sponsor_id uuid references public.members (id) on delete restrict,
  role text not null default 'member' check (role in ('owner', 'member')),
  photo_url text not null default '',
  verified boolean not null default false,
  joined_at timestamptz not null default now(),
  check (role = 'owner' or sponsor_id is not null)
);
create unique index members_single_owner on public.members (role) where role = 'owner';
create index members_sponsor_idx on public.members (sponsor_id);

create table public.settings (
  id int primary key default 1 check (id = 1),
  network_name text not null default 'Rasl Estate',
  phone text not null default '',
  currency text not null default 'USD',
  plan jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  plot_no text not null default '',
  ptype text not null default 'house' check (ptype in ('plot', 'house', 'villa', 'apartment', 'shop')),
  purpose text not null default 'sale' check (purpose in ('sale', 'rent')),
  price numeric not null default 0 check (price >= 0),
  area numeric, beds int, baths int, built int,
  city text not null default '', district text not null default '',
  lat double precision, lng double precision,
  design text not null default '',
  photos jsonb not null default '[]', videos jsonb not null default '[]',
  status text not null default 'available' check (status in ('available', 'reserved', 'sold', 'rented')),
  featured boolean not null default false,
  created_by uuid default auth.uid() references public.members (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete set null,
  title text not null default '',
  seller_id uuid not null references public.members (id) on delete restrict,
  buyer_name text not null check (char_length(buyer_name) between 1 and 120),
  buyer_phone text not null default '',
  buyer_member_id uuid references public.members (id) on delete set null,
  amount numeric not null check (amount > 0),
  discount numeric not null default 0 check (discount >= 0),
  payment_method text not null default 'cash' check (payment_method in ('cash', 'card', 'wallet', 'bank')),
  sold_on date not null default current_date,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index sales_seller_idx on public.sales (seller_id, sold_on);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null default auth.uid() references public.members (id) on delete cascade,
  kind text not null check (kind in ('buy', 'sell', 'rent')),
  ptype text not null default 'house' check (ptype in ('plot', 'house', 'villa', 'apartment', 'shop')),
  title text not null check (char_length(title) between 1 and 120),
  details text not null default '', price numeric, city text not null default '', district text not null default '',
  phone text not null default '', photos jsonb not null default '[]', videos jsonb not null default '[]',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create table public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  body text not null default '', link text not null default '',
  property_id uuid references public.properties (id) on delete set null,
  photos jsonb not null default '[]', videos jsonb not null default '[]',
  starts date, ends date, featured boolean not null default true,
  created_by uuid default auth.uid() references public.members (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null, details text not null default '',
  starts date not null, ends date not null check (ends >= starts),
  target_sales int not null default 0 check (target_sales >= 0),
  target_members int not null default 0 check (target_members >= 0),
  reward text not null default '',
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null default auth.uid() references public.members (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  phone text not null default '', want text not null default 'buy' check (want in ('buy', 'rent', 'sell')),
  ptype text not null default 'house', budget numeric, city text not null default '',
  stage text not null default 'new' check (stage in ('new', 'contacted', 'visit', 'negotiation', 'won', 'lost')),
  source text not null default 'walkin', property_id uuid references public.properties (id) on delete set null,
  next_follow_up date, notes text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index leads_member_idx on public.leads (member_id);

create table public.tutorials (
  id uuid primary key default gen_random_uuid(),
  title text not null, body text not null default '', video_url text not null default '',
  sort int not null default 0, created_at timestamptz not null default now()
);

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null default auth.uid() references public.members (id) on delete cascade,
  text text not null check (char_length(text) between 3 and 1000),
  status text not null default 'open' check (status in ('open', 'helped')),
  created_at timestamptz not null default now()
);

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null check (amount > 0), given_to text not null, note text not null default '',
  given_on date not null default current_date, created_at timestamptz not null default now()
);

create table public.member_documents (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null default auth.uid() references public.members (id) on delete cascade,
  kind text not null default 'id_card', path text not null,
  uploaded_at timestamptz not null default now()
);

-- ===================== helpers =====================
create or replace function private.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members where id = (select auth.uid()) and role = 'owner');
$$;
create or replace function private.is_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members where id = (select auth.uid()));
$$;
create or replace function private.downline(top uuid) returns setof uuid
language sql stable security definer set search_path = '' as $$
  with recursive d(id) as (
    select m.id from public.members m where m.sponsor_id = top
    union select m.id from public.members m join d on m.sponsor_id = d.id
  ) select id from d;
$$;
create or replace function private.new_code() returns text
language plpgsql volatile set search_path = '' as $$
declare c text;
begin
  loop
    c := 'RE' || lpad((floor(random() * 100000000))::bigint::text, 8, '0');
    exit when not exists (select 1 from public.members where code = c);
  end loop;
  return c;
end $$;
create or replace function private.is_active(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members where id = uid and role = 'owner')
      or exists (select 1 from public.sales s where (s.seller_id = uid or s.buyer_member_id = uid)
                 and s.sold_on >= current_date - make_interval(months => coalesce(((select plan from public.settings where id = 1)->>'activityMonths')::int, 12)));
$$;
revoke all on function private.is_owner(), private.is_member(), private.downline(uuid), private.new_code(), private.is_active(uuid) from public;
grant execute on function private.is_owner(), private.is_member(), private.downline(uuid), private.is_active(uuid) to authenticated, anon;

-- ===================== registration =====================
create or replace function public.register_member(first_name text, father_name text, grandfather_name text, phone text, sponsor_code text default null, own_code text default null)
returns public.members
language plpgsql security definer set search_path = '' as $$
declare me public.members; s public.members; c text := upper(nullif(trim(coalesce(own_code, '')), '')); ph text := regexp_replace(coalesce(phone, ''), '[^0-9+]', '', 'g');
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if exists (select 1 from public.members where id = auth.uid()) then raise exception 'You are already registered'; end if;
  if trim(coalesce(first_name, '')) = '' or trim(coalesce(father_name, '')) = '' or trim(coalesce(grandfather_name, '')) = '' then raise exception 'Enter your full three-part name'; end if;
  if char_length(ph) < 7 then raise exception 'Enter a valid mobile number'; end if;
  if exists (select 1 from public.members where public.members.phone = ph) then raise exception 'This phone number is already registered'; end if;
  if c is not null and c !~ '^[A-Z0-9]{4,16}$' then raise exception 'Codes use 4 to 16 letters and numbers'; end if;
  if c is not null and exists (select 1 from public.members where code = c) then raise exception 'That code is already taken'; end if;
  if not exists (select 1 from public.members where role = 'owner') then
    insert into public.members (id, first_name, father_name, grandfather_name, email, phone, code, role)
      values (auth.uid(), trim(first_name), trim(father_name), trim(grandfather_name), coalesce((select email from auth.users where id = auth.uid()), ''), ph, coalesce(c, private.new_code()), 'owner')
      returning * into me;
    return me;
  end if;
  select * into s from public.members where code = upper(trim(coalesce(sponsor_code, '')));
  if not found then raise exception 'A sponsor code is required. Ask the person who invited you for their code.'; end if;
  if coalesce(((select plan from public.settings where id = 1)->>'requireActiveSponsor')::boolean, true) and not private.is_active(s.id) then
    raise exception 'This sponsor code is not active yet. It becomes active after its owner records a sale.';
  end if;
  insert into public.members (id, first_name, father_name, grandfather_name, email, phone, code, role, sponsor_id)
    values (auth.uid(), trim(first_name), trim(father_name), trim(grandfather_name), coalesce((select email from auth.users where id = auth.uid()), ''), ph, coalesce(c, private.new_code()), 'member', s.id)
    returning * into me;
  return me;
end $$;

create or replace function public.lookup_code(code_in text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('name', m.first_name || ' ' || m.father_name, 'active', private.is_active(m.id))
  from public.members m where m.code = upper(trim(code_in));
$$;
create or replace function public.network_status() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('hasOwner', exists (select 1 from public.members where role = 'owner'));
$$;

create or replace function public.submit_interest(property uuid, full_name text, phone text, note text, ref text)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare owner_id uuid; p public.properties; ph text := left(regexp_replace(coalesce(phone, ''), '[^0-9+]', '', 'g'), 20);
begin
  full_name := left(trim(coalesce(full_name, '')), 80);
  if char_length(full_name) < 2 or char_length(ph) < 7 then raise exception 'Enter your name and phone number'; end if;
  select * into p from public.properties where id = property;
  if not found then raise exception 'This property is not available'; end if;
  select id into owner_id from public.members where code = upper(trim(coalesce(ref, '')));
  if owner_id is null then select id into owner_id from public.members where role = 'owner'; end if;
  if owner_id is null then raise exception 'This property is not available'; end if;
  if exists (select 1 from public.leads where public.leads.phone = ph and property_id = property and created_at > now() - interval '1 day') then return true; end if;
  if (select count(*) from public.leads where source = 'website' and created_at > now() - interval '1 hour') >= 60 then raise exception 'Too many requests. Try again in a little while.'; end if;
  insert into public.leads (member_id, name, phone, want, ptype, budget, city, stage, source, property_id, next_follow_up, notes)
    values (owner_id, full_name, ph, case p.purpose when 'rent' then 'rent' else 'buy' end, p.ptype, p.price, p.city, 'new', 'website', p.id, current_date, left(coalesce(note, ''), 500));
  return true;
end $$;

revoke all on function public.register_member(text, text, text, text, text, text), public.lookup_code(text), public.network_status(), public.submit_interest(uuid, text, text, text, text) from public;
grant execute on function public.register_member(text, text, text, text, text, text) to authenticated;
grant execute on function public.lookup_code(text), public.network_status(), public.submit_interest(uuid, text, text, text, text) to anon, authenticated;

-- ===================== access rules =====================
alter table public.members enable row level security;
alter table public.settings enable row level security;
alter table public.properties enable row level security;
alter table public.sales enable row level security;
alter table public.requests enable row level security;
alter table public.ads enable row level security;
alter table public.offers enable row level security;
alter table public.leads enable row level security;
alter table public.tutorials enable row level security;
alter table public.wishes enable row level security;
alter table public.donations enable row level security;
alter table public.member_documents enable row level security;

create policy "see own network" on public.members for select to authenticated using (
  id = (select auth.uid()) or private.is_owner()
  or id = (select m.sponsor_id from public.members m where m.id = (select auth.uid()))
  or id in (select private.downline((select auth.uid()))));
create policy "edit own profile" on public.members for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "owner verifies members" on public.members for update to authenticated using (private.is_owner()) with check (true);

create policy "anyone reads settings" on public.settings for select to anon, authenticated using (true);
create policy "owner edits settings" on public.settings for update to authenticated using (private.is_owner()) with check (true);
create policy "anyone reads properties" on public.properties for select to anon, authenticated using (true);
create policy "members add properties" on public.properties for insert to authenticated with check (private.is_member());
create policy "owner or author edits properties" on public.properties for update to authenticated using (private.is_owner() or created_by = (select auth.uid())) with check (true);
create policy "owner or author deletes properties" on public.properties for delete to authenticated using (private.is_owner() or created_by = (select auth.uid()));
create policy "anyone reads ads" on public.ads for select to anon, authenticated using (true);
create policy "members add ads" on public.ads for insert to authenticated with check (private.is_member());
create policy "owner or author edits ads" on public.ads for update to authenticated using (private.is_owner() or created_by = (select auth.uid())) with check (true);
create policy "owner or author deletes ads" on public.ads for delete to authenticated using (private.is_owner() or created_by = (select auth.uid()));
create policy "anyone reads offers" on public.offers for select to anon, authenticated using (true);
create policy "owner manages offers" on public.offers for all to authenticated using (private.is_owner()) with check (private.is_owner());
create policy "anyone reads lessons" on public.tutorials for select to anon, authenticated using (true);
create policy "owner manages lessons" on public.tutorials for all to authenticated using (private.is_owner()) with check (private.is_owner());

create policy "see sales in your network" on public.sales for select to authenticated using (
  private.is_owner() or seller_id = (select auth.uid()) or buyer_member_id = (select auth.uid())
  or seller_id in (select private.downline((select auth.uid()))));
create policy "record your own sale" on public.sales for insert to authenticated with check (private.is_owner() or seller_id = (select auth.uid()));
create policy "owner corrects sales" on public.sales for update to authenticated using (private.is_owner()) with check (true);
create policy "owner removes sales" on public.sales for delete to authenticated using (private.is_owner());

create policy "members read requests" on public.requests for select to authenticated using (private.is_member());
create policy "members post requests" on public.requests for insert to authenticated with check (member_id = (select auth.uid()));
create policy "author or owner edits requests" on public.requests for update to authenticated using (member_id = (select auth.uid()) or private.is_owner()) with check (true);
create policy "author or owner deletes requests" on public.requests for delete to authenticated using (member_id = (select auth.uid()) or private.is_owner());

create policy "see leads in your network" on public.leads for select to authenticated using (
  private.is_owner() or member_id = (select auth.uid()) or member_id in (select private.downline((select auth.uid()))));
create policy "add your leads" on public.leads for insert to authenticated with check (member_id = (select auth.uid()) or private.is_owner());
create policy "edit your leads" on public.leads for update to authenticated using (member_id = (select auth.uid()) or private.is_owner()) with check (true);
create policy "delete your leads" on public.leads for delete to authenticated using (member_id = (select auth.uid()) or private.is_owner());

create policy "members read wishes" on public.wishes for select to authenticated using (private.is_member());
create policy "members add wishes" on public.wishes for insert to authenticated with check (member_id = (select auth.uid()));
create policy "owner updates wishes" on public.wishes for update to authenticated using (private.is_owner()) with check (true);
create policy "author or owner deletes wishes" on public.wishes for delete to authenticated using (member_id = (select auth.uid()) or private.is_owner());
create policy "members read donations" on public.donations for select to authenticated using (private.is_member());
create policy "owner manages donations" on public.donations for all to authenticated using (private.is_owner()) with check (private.is_owner());

create policy "own or owner reads documents" on public.member_documents for select to authenticated using (member_id = (select auth.uid()) or private.is_owner());
create policy "member adds documents" on public.member_documents for insert to authenticated with check (member_id = (select auth.uid()));
create policy "member deletes documents" on public.member_documents for delete to authenticated using (member_id = (select auth.uid()));

grant select on public.settings, public.properties, public.ads, public.offers, public.tutorials to anon;
grant select, insert, update, delete on public.members, public.properties, public.sales, public.requests, public.ads, public.offers, public.leads, public.tutorials, public.wishes, public.donations, public.member_documents to authenticated;
grant select, update on public.settings to authenticated;
revoke update on public.members from authenticated;
grant update (first_name, father_name, grandfather_name, photo_url, verified) on public.members to authenticated;

-- ===================== storage =====================
create policy "members upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'project-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "members delete own media" on storage.objects for delete to authenticated
  using (bucket_id = 'project-media' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_owner()));
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('member-docs', 'member-docs', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;
create policy "members upload own documents" on storage.objects for insert to authenticated
  with check (bucket_id = 'member-docs' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "member or owner reads documents" on storage.objects for select to authenticated
  using (bucket_id = 'member-docs' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_owner()));
create policy "members delete own documents" on storage.objects for delete to authenticated
  using (bucket_id = 'member-docs' and (storage.foldername(name))[1] = (select auth.uid())::text);

alter publication supabase_realtime add table public.leads, public.sales, public.requests, public.properties, public.ads, public.members;
