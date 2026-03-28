create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  status text not null default 'processing' check (status in ('processing', 'processed', 'failed')),
  retries integer not null default 0,
  payload jsonb,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_webhook_events_type_created_idx
  on public.stripe_webhook_events (event_type, created_at desc);

create index if not exists stripe_webhook_events_status_created_idx
  on public.stripe_webhook_events (status, created_at desc);

alter table public.stripe_webhook_events enable row level security;

-- No user-facing policies: this table is backend/internal only.

create or replace function public.set_stripe_webhook_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_stripe_webhook_events_updated_at on public.stripe_webhook_events;
create trigger trg_stripe_webhook_events_updated_at
before update on public.stripe_webhook_events
for each row execute function public.set_stripe_webhook_events_updated_at();
