-- Phase 1 foundation schema for WTF Do I Eat
-- Compatible with Supabase/Postgres.

create extension if not exists pgcrypto;

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  suburb text,
  province text,
  country text not null default 'South Africa',
  lat numeric(9, 6) not null,
  lng numeric(9, 6) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint locations_lat_range check (lat between -90 and 90),
  constraint locations_lng_range check (lng between -180 and 180)
);

create unique index if not exists locations_city_suburb_lat_lng_uidx
  on public.locations (city, coalesce(suburb, ''), lat, lng);

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete restrict,
  name text not null,
  area text not null,
  vibe text,
  known_for text,
  google_place_id text,
  rating numeric(2, 1) not null default 0,
  price_tier text not null,
  moods text[] not null default '{}',
  is_active boolean not null default true,
  source text not null default 'seed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurants_rating_range check (rating >= 0 and rating <= 5),
  constraint restaurants_price_tier check (price_tier in ('local', 'budget', 'mid', 'splurge', 'baller')),
  constraint restaurants_moods_nonempty check (array_length(moods, 1) >= 1)
);

create unique index if not exists restaurants_google_place_id_uidx
  on public.restaurants (google_place_id)
  where google_place_id is not null;

create index if not exists restaurants_location_idx on public.restaurants (location_id);
create index if not exists restaurants_price_tier_idx on public.restaurants (price_tier);
create index if not exists restaurants_rating_idx on public.restaurants (rating desc);
create index if not exists restaurants_moods_gin_idx on public.restaurants using gin (moods);

alter table public.locations enable row level security;
alter table public.restaurants enable row level security;

-- Public read policy for MVP discovery use-case.
drop policy if exists "Public read locations" on public.locations;
create policy "Public read locations"
  on public.locations
  for select
  using (true);

drop policy if exists "Public read restaurants" on public.restaurants;
create policy "Public read restaurants"
  on public.restaurants
  for select
  using (true);
