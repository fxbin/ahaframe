-- Confirmed reset history is public product data. Allow the publishable-key
-- client to serve it when privileged server credentials or upstream feeds are
-- unavailable. Detected/rejected rows remain private to the ingestion pipeline.

grant select on table public.codex_reset_events to anon, authenticated;

drop policy if exists "Public can read confirmed Codex reset events" on public.codex_reset_events;

create policy "Public can read confirmed Codex reset events"
on public.codex_reset_events
for select
to anon, authenticated
using (status = 'confirmed');
