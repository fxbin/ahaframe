create table if not exists public.codex_reset_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null,
  detected_at timestamptz not null default now(),
  status text not null check (status in ('detected', 'confirmed', 'rejected')),
  kind text not null default 'full' check (kind in ('full', 'banked')),
  source_type text not null,
  source_external_id text,
  source_url text not null,
  source_label text not null,
  evidence_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint codex_reset_events_source_external_id_unique unique (source_type, source_external_id)
);

create index if not exists codex_reset_events_occurred_at_idx
  on public.codex_reset_events (occurred_at desc);

create index if not exists codex_reset_events_status_kind_idx
  on public.codex_reset_events (status, kind, occurred_at desc);

alter table public.codex_reset_events enable row level security;

-- Reset radar reads/writes stay server-side through the service role.
-- No anon/authenticated policy is intentionally granted in V0.

insert into public.codex_reset_events (
  occurred_at,
  detected_at,
  status,
  kind,
  source_type,
  source_external_id,
  source_url,
  source_label,
  evidence_text
)
values
  (
    '2026-09-12T08:09:00Z',
    '2026-09-12T08:09:00Z',
    'confirmed',
    'full',
    'x_tibo',
    '2098685367058612394',
    'https://x.com/thsottiaux/status/2098685367058612394',
    'Tibo (@thsottiaux) on X',
    'Tibo confirmed that the reset had fully propagated.'
  ),
  (
    '2026-09-08T01:56:00Z',
    '2026-09-08T01:56:00Z',
    'confirmed',
    'full',
    'x_tibo',
    '2097174560412246215',
    'https://x.com/thsottiaux/status/2097174560412246215',
    'Tibo (@thsottiaux) on X',
    'Tibo confirmed a full reset for everyone.'
  ),
  (
    '2026-08-31T02:29:00Z',
    '2026-08-31T02:29:00Z',
    'confirmed',
    'full',
    'x_tibo',
    '2094251180121854309',
    'https://x.com/thsottiaux/status/2094251180121854309',
    'Tibo (@thsottiaux) on X',
    'Tibo confirmed usage had been reset for paid Codex and ChatGPT Work subscriptions.'
  )
on conflict (source_type, source_external_id) do nothing;
