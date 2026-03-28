create table if not exists public.app_metric_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text not null,
  event_name text not null,
  event_props jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists app_metric_events_event_occurred_idx
  on public.app_metric_events (event_name, occurred_at desc);

create index if not exists app_metric_events_user_occurred_idx
  on public.app_metric_events (user_id, occurred_at desc);

create index if not exists app_metric_events_session_occurred_idx
  on public.app_metric_events (session_id, occurred_at desc);

alter table public.app_metric_events enable row level security;

drop policy if exists "Users can read own metric events" on public.app_metric_events;
create policy "Users can read own metric events"
  on public.app_metric_events
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own metric events" on public.app_metric_events;
create policy "Users can insert own metric events"
  on public.app_metric_events
  for insert
  with check (auth.uid() = user_id);
