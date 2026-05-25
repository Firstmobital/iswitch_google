-- ============================================================
-- iSwitch Google — Supabase Schema
-- Run this entire file in Supabase → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── ENUMS ──────────────────────────────────────────────────
create type user_role as enum ('retailer', 'admin');
create type approval_status as enum ('pending', 'approved', 'rejected');
create type scheme_status as enum ('draft', 'published', 'expired');
create type swipe_type as enum ('Full Swipe', 'NCEMI', 'Full Swipe/NCEMI');
create type finance_partner as enum ('Bajaj Finance', 'IDFC Paper Finance', 'TVS Credit');

-- ── PROFILES ───────────────────────────────────────────────
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text,
  shop_name       text,
  phone           text,
  city            text,
  role            user_role not null default 'retailer',
  approval_status approval_status not null default 'pending',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── MOBILE MODELS ──────────────────────────────────────────
create table mobile_models (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  storage        text not null,
  color_options  text,
  image_url      text,
  is_active      boolean not null default true,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now()
);

-- ── SCHEMES ────────────────────────────────────────────────
create table schemes (
  id                    uuid primary key default uuid_generate_v4(),
  model_id              uuid not null references mobile_models(id) on delete cascade,
  status                scheme_status not null default 'draft',
  mop                   numeric(10,2) not null,
  dealer_landing        numeric(10,2),
  consumer_offer_gst    numeric(10,2) default 0,
  consumer_offer_note   text,
  cashback_hdfc_emi     numeric(10,2) default 0,
  cashback_hdfc_full    numeric(10,2) default 0,
  min_swipe             numeric(10,2),
  max_swipe             numeric(10,2),
  swipe_type            swipe_type not null default 'Full Swipe/NCEMI',
  emi_months            text[] default '{}',
  valid_from            date not null,
  valid_to              date not null,
  notes                 text,
  created_by            uuid references profiles(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ── EXCHANGE OFFERS ────────────────────────────────────────
create table exchange_offers (
  id              uuid primary key default uuid_generate_v4(),
  scheme_id       uuid not null references schemes(id) on delete cascade,
  platform        text not null,
  bonus_label     text,
  tier_3_10k      numeric(10,2) default 0,
  tier_10_15k     numeric(10,2) default 0,
  tier_15k_plus   numeric(10,2) default 0,
  created_at      timestamptz not null default now()
);

-- ── FINANCE SCHEMES ────────────────────────────────────────
create table finance_schemes (
  id                  uuid primary key default uuid_generate_v4(),
  scheme_id           uuid not null references schemes(id) on delete cascade,
  partner             finance_partner not null,
  tenure_options      text not null,
  dealer_charge_pct   numeric(5,2) default 2.0,
  notes               text,
  created_at          timestamptz not null default now()
);

-- ── INDEXES ────────────────────────────────────────────────
create index on schemes(model_id);
create index on schemes(status);
create index on schemes(valid_from, valid_to);
create index on exchange_offers(scheme_id);
create index on finance_schemes(scheme_id);
create index on profiles(role);
create index on profiles(approval_status);

-- ── UPDATED_AT TRIGGER ─────────────────────────────────────
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function handle_updated_at();

create trigger schemes_updated_at
  before update on schemes
  for each row execute function handle_updated_at();

-- ── AUTO-CREATE PROFILE ON SIGNUP ──────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, shop_name, phone, city)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'shop_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'city'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── ROW LEVEL SECURITY ─────────────────────────────────────
alter table profiles enable row level security;
alter table mobile_models enable row level security;
alter table schemes enable row level security;
alter table exchange_offers enable row level security;
alter table finance_schemes enable row level security;

-- Profiles: users see own row; admins see all
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "Admins can update all profiles"
  on profiles for update
  using (exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- Mobile models: approved retailers & admins can read; only admins write
create policy "Approved retailers can view models"
  on mobile_models for select
  using (exists (
    select 1 from profiles p
    where p.id = auth.uid()
    and (p.role = 'admin' or (p.role = 'retailer' and p.approval_status = 'approved'))
  ));

create policy "Admins can manage models"
  on mobile_models for all
  using (exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- Schemes: approved retailers see published; admins see all
create policy "Approved retailers view published schemes"
  on schemes for select
  using (
    status = 'published' and
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.approval_status = 'approved'
    )
  );

create policy "Admins can manage schemes"
  on schemes for all
  using (exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- Exchange offers follow scheme access
create policy "Retailers view exchange offers for published schemes"
  on exchange_offers for select
  using (exists (
    select 1 from schemes s
    where s.id = scheme_id and s.status = 'published'
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.approval_status = 'approved'
    )
  ));

create policy "Admins manage exchange offers"
  on exchange_offers for all
  using (exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- Finance schemes follow scheme access
create policy "Retailers view finance schemes for published"
  on finance_schemes for select
  using (exists (
    select 1 from schemes s
    where s.id = scheme_id and s.status = 'published'
    and exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.approval_status = 'approved'
    )
  ));

create policy "Admins manage finance schemes"
  on finance_schemes for all
  using (exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role = 'admin'
  ));

-- ── SEED: MOBILE MODELS ────────────────────────────────────
insert into mobile_models (name, storage, color_options, sort_order) values
('Pixel 9a',        '256 GB',  'Iris, Peony, Porcelain, Obsidian', 1),
('Pixel 10',        '128/256 GB', 'Obsidian, Porcelain, Hazel, Rose Quartz', 2),
('Pixel 10 Pro',    '256 GB',  'Obsidian, Porcelain, Hazel', 3),
('Pixel 10 Pro XL', '256 GB',  'Obsidian, Porcelain, Hazel', 4),
('Pixel 10 Pro Fold','256 GB', 'Obsidian, Porcelain', 5),
('Pixel 10a',       '128 GB',  'Obsidian, Porcelain, Peony', 6);

-- ── DONE ───────────────────────────────────────────────────
-- After running this:
-- 1. Go to Authentication → Settings → enable Email confirmations
-- 2. Create your first admin user via Supabase Auth dashboard
-- 3. Manually set that user's role to 'admin' and approval_status to 'approved' in the profiles table
