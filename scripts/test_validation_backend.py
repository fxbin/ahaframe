from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
base_migration=(ROOT/'supabase/migrations/20260814023253_validation_alpha.sql').read_text(encoding='utf-8').lower()
cohort_migration=(ROOT/'supabase/migrations/20260815071500_validation_cohort.sql').read_text(encoding='utf-8').lower()
product_feedback_migration=(ROOT/'supabase/migrations/20260816085500_product_feedback.sql').read_text(encoding='utf-8').lower()
function=(ROOT/'supabase/functions/validation-ingest/index.ts').read_text(encoding='utf-8')

for table in ['validation_events','aha_feedback','validation_waitlist']:
    if f'create table if not exists public.{table}' not in base_migration:
        raise SystemExit(f'missing validation table: {table}')
    if f'alter table public.{table} enable row level security' not in base_migration:
        raise SystemExit(f'RLS must be enabled for {table}')
    if f'revoke all on public.{table} from anon, authenticated' not in base_migration:
        raise SystemExit(f'public roles must have no direct access to {table}')
    if f'alter table public.{table}' not in cohort_migration:
        raise SystemExit(f'missing cohort migration for {table}')

for token in ['event_id text not null unique','feedback_id text not null unique','email text not null unique']:
    if token not in base_migration:
        raise SystemExit(f'missing idempotency/uniqueness contract: {token}')

if cohort_migration.count("add column if not exists cohort_id text not null default ''") != 3:
    raise SystemExit('cohort_id must be added to all three original validation tables')
if cohort_migration.count("cohort_id ~ '^[a-z0-9][a-z0-9._-]{0,79}$'") != 3:
    raise SystemExit('cohort_id storage must enforce the shared safe naming contract')

for token in [
    'create table if not exists public.product_feedback',
    'product_feedback_id text not null unique',
    "feedback_type text not null check (feedback_type in ('bug','confusing','feature','other'))",
    'message text not null',
    'alter table public.product_feedback enable row level security',
    'revoke all on public.product_feedback from anon, authenticated',
    'grant select, insert, update on public.product_feedback to service_role',
]:
    if token not in product_feedback_migration:
        raise SystemExit(f'product feedback storage missing required boundary: {token}')

for token in [
    "AHAFRAME_ALLOWED_ORIGINS",
    "req.method === 'OPTIONS'",
    "req.method !== 'POST'",
    "payload too large",
    "validation_events",
    "aha_feedback",
    "product_feedback",
    "validation_waitlist",
    "ingestProductFeedback",
    "ignoreDuplicates: true",
    "SUPABASE_SERVICE_ROLE_KEY",
    "function cohort(value: unknown)",
]:
    if token not in function:
        raise SystemExit(f'validation-ingest missing required boundary: {token}')

if function.count('cohort_id: cohort(body.cohortId)') != 4:
    raise SystemExit('validation-ingest must persist cohort_id for event, Aha feedback, product feedback, and waitlist payloads')

for forbidden in ['SUPABASE_ANON_KEY','sb_secret_','service_role=']:
    if forbidden in function:
        raise SystemExit(f'validation-ingest contains forbidden client/static credential pattern: {forbidden}')

print('PASS Validation Backend: RLS/revokes, idempotent keys, anonymous cohort storage, separate product feedback storage, public-ingest boundaries, and server-only credential contract validated.')
