create table if not exists public.user_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  restaurant_name text not null,
  restaurant_area text not null,
  mood text not null,
  budget text not null,
  personality_title text,
  personality_emoji text,
  picked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists user_history_user_created_idx
  on public.user_history (user_id, created_at desc);

create table if not exists public.recommendation_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rating text not null check (rating in ('up', 'down')),
  restaurant_name text not null,
  restaurant_area text,
  mood text,
  budget text,
  created_at timestamptz not null default now()
);

create index if not exists recommendation_feedback_user_created_idx
  on public.recommendation_feedback (user_id, created_at desc);

alter table public.user_history enable row level security;
alter table public.recommendation_feedback enable row level security;

drop policy if exists "Users can read own history" on public.user_history;
create policy "Users can read own history"
  on public.user_history
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own history" on public.user_history;
create policy "Users can insert own history"
  on public.user_history
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own history" on public.user_history;
create policy "Users can delete own history"
  on public.user_history
  for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own feedback" on public.recommendation_feedback;
create policy "Users can insert own feedback"
  on public.recommendation_feedback
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own feedback" on public.recommendation_feedback;
create policy "Users can read own feedback"
  on public.recommendation_feedback
  for select
  using (auth.uid() = user_id);