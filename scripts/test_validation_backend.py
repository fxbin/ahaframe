from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
migration=(ROOT/'supabase/migrations/20260814023253_validation_alpha.sql').read_text(encoding='utf-8').lower()
function=(ROOT/'supabase/functions/validation-ingest/index.ts').read_text(encoding='utf-8')

for table in ['validation_events','aha_feedback','validation_waitlist']:
    if f'create table if not exists public.{table}' not in migration:
        raise SystemExit(f'missing validation table: {table}')
    if f'alter table public.{table} enable row level security' not in migration:
        raise SystemExit(f'RLS must be enabled for {table}')
    if f'revoke all on public.{table} from anon, authenticated' not in migration:
        raise SystemExit(f'public roles must have no direct access to {table}')

for token in ['event_id text not null unique','feedback_id text not null unique','email text not null unique']:
    if token not in migration:
        raise SystemExit(f'missing idempotency/uniqueness contract: {token}')

for token in [
    "AHAFRAME_ALLOWED_ORIGINS",
    "req.method === 'OPTIONS'",
    "req.method !== 'POST'",
    "payload too large",
    "validation_events",
    "aha_feedback",
    "validation_waitlist",
    "ignoreDuplicates: true",
    "SUPABASE_SERVICE_ROLE_KEY",
]:
    if token not in function:
        raise SystemExit(f'validation-ingest missing required boundary: {token}')

for forbidden in ['SUPABASE_ANON_KEY','sb_secret_','service_role=']:
    if forbidden in function:
        raise SystemExit(f'validation-ingest contains forbidden client/static credential pattern: {forbidden}')

print('PASS Validation Backend: RLS/revokes, idempotent keys, public-ingest boundaries, and server-only credential contract validated.')
