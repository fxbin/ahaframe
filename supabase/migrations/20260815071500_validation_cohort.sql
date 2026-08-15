alter table public.validation_events
  add column if not exists cohort_id text not null default '';

alter table public.aha_feedback
  add column if not exists cohort_id text not null default '';

alter table public.validation_waitlist
  add column if not exists cohort_id text not null default '';

alter table public.validation_events
  drop constraint if exists validation_events_cohort_id_check,
  add constraint validation_events_cohort_id_check
    check (cohort_id = '' or cohort_id ~ '^[a-z0-9][a-z0-9._-]{0,79}$');

alter table public.aha_feedback
  drop constraint if exists aha_feedback_cohort_id_check,
  add constraint aha_feedback_cohort_id_check
    check (cohort_id = '' or cohort_id ~ '^[a-z0-9][a-z0-9._-]{0,79}$');

alter table public.validation_waitlist
  drop constraint if exists validation_waitlist_cohort_id_check,
  add constraint validation_waitlist_cohort_id_check
    check (cohort_id = '' or cohort_id ~ '^[a-z0-9][a-z0-9._-]{0,79}$');

create index if not exists validation_events_cohort_name_ts_idx
  on public.validation_events (cohort_id, name, event_ts desc);

create index if not exists aha_feedback_cohort_lab_ts_idx
  on public.aha_feedback (cohort_id, lab_id, submitted_at desc);

create index if not exists validation_waitlist_cohort_intent_idx
  on public.validation_waitlist (cohort_id, intent, updated_at desc);
