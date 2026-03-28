create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'inactive' check (status in ('inactive', 'active', 'trialing', 'past_due', 'canceled')),
  plan text not null default 'free',
  source text not null default 'manual',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_subscriptions_user_idx
  on public.user_subscriptions (user_id);

alter table public.user_subscriptions enable row level security;

drop policy if exists "Users can read own subscription" on public.user_subscriptions;
create policy "Users can read own subscription"
  on public.user_subscriptions
  for select
  using (auth.uid() = user_id);

create or replace function public.set_user_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_subscriptions_updated_at on public.user_subscriptions;
create trigger trg_user_subscriptions_updated_at
before update on public.user_subscriptions
for each row execute function public.set_user_subscriptions_updated_at();
