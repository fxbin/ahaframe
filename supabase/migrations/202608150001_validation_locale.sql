alter table public.validation_events
  add column if not exists locale text not null default 'en';

alter table public.aha_feedback
  add column if not exists locale text not null default 'en';

alter table public.validation_waitlist
  add column if not exists locale text not null default 'en';

alter table public.validation_events
  drop constraint if exists validation_events_locale_check,
  add constraint validation_events_locale_check check (locale in ('en','zh-CN'));

alter table public.aha_feedback
  drop constraint if exists aha_feedback_locale_check,
  add constraint aha_feedback_locale_check check (locale in ('en','zh-CN'));

alter table public.validation_waitlist
  drop constraint if exists validation_waitlist_locale_check,
  add constraint validation_waitlist_locale_check check (locale in ('en','zh-CN'));

create index if not exists validation_events_locale_name_ts_idx
  on public.validation_events (locale, name, event_ts desc);

create index if not exists aha_feedback_locale_lab_ts_idx
  on public.aha_feedback (locale, lab_id, submitted_at desc);

create index if not exists validation_waitlist_locale_intent_idx
  on public.validation_waitlist (locale, intent, updated_at desc);
