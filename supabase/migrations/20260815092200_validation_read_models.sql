-- Validation Alpha M2: deterministic product-decision read models.
-- Additive only: views/functions over existing Validation Alpha evidence tables.

create or replace view public.validation_product_events_v1
with (security_invoker = true) as
select *
from public.validation_events
where cohort_id <> 'production-smoke'
  and name <> 'production_smoke_test';

create or replace view public.validation_feedback_latest_v1
with (security_invoker = true) as
select distinct on (cohort_id, anonymous_user_id, lab_id)
  id,
  feedback_id,
  anonymous_user_id,
  session_id,
  cohort_id,
  locale,
  layer,
  lab_id,
  lab_version,
  path,
  rating,
  strong_aha,
  note,
  attribution,
  device_class,
  submitted_at,
  received_at
from public.aha_feedback
where cohort_id <> 'production-smoke'
order by cohort_id, anonymous_user_id, lab_id, submitted_at desc, id desc;

create or replace view public.validation_user_lab_facts_v1
with (security_invoker = true) as
with lab_events as (
  select *
  from public.validation_product_events_v1
  where lab_id <> ''
),
first_start as (
  select distinct on (cohort_id, anonymous_user_id, lab_id)
    cohort_id,
    anonymous_user_id,
    lab_id,
    event_ts as first_started_at,
    name as start_event_name,
    locale as start_locale,
    layer as start_layer,
    lab_version as start_lab_version,
    utm_source as start_utm_source,
    utm_medium as start_utm_medium,
    utm_campaign as start_utm_campaign,
    first_utm_source as lifetime_first_utm_source,
    referrer as start_referrer,
    device_class as start_device_class
  from lab_events
  where name in ('lab_started', 'capstone_started')
  order by cohort_id, anonymous_user_id, lab_id, event_ts, id
),
event_agg as (
  select
    cohort_id,
    anonymous_user_id,
    lab_id,
    min(event_ts) as first_activity_at,
    max(event_ts) as last_activity_at,
    min(event_ts) filter (where name = 'lab_started') as lab_started_at,
    min(event_ts) filter (where name = 'capstone_started') as capstone_started_at,
    min(event_ts) filter (where name = 'meaningful_interaction') as meaningful_interaction_at,
    min(event_ts) filter (where name = 'failure_tradeoff_observed') as failure_tradeoff_observed_at,
    min(event_ts) filter (where name = 'capstone_completed') as capstone_completed_at,
    bool_or(name = 'lab_started') as lab_started,
    bool_or(name = 'capstone_started') as capstone_started,
    bool_or(name = 'meaningful_interaction') as meaningful_interaction,
    bool_or(name = 'failure_tradeoff_observed') as failure_tradeoff_observed,
    bool_or(name = 'capstone_completed') as capstone_completed,
    count(*) as event_count,
    count(distinct session_id) as session_count
  from lab_events
  group by cohort_id, anonymous_user_id, lab_id
)
select
  a.cohort_id,
  a.anonymous_user_id,
  a.lab_id,
  s.first_started_at,
  s.start_event_name,
  coalesce(s.start_locale, f.locale, '') as start_locale,
  coalesce(s.start_layer, f.layer, '') as layer,
  coalesce(s.start_lab_version, f.lab_version, '') as lab_version,
  coalesce(s.start_utm_source, '') as utm_source,
  coalesce(s.start_utm_medium, '') as utm_medium,
  coalesce(s.start_utm_campaign, '') as utm_campaign,
  coalesce(s.lifetime_first_utm_source, '') as lifetime_first_utm_source,
  coalesce(s.start_referrer, '') as referrer,
  coalesce(s.start_device_class, f.device_class, '') as device_class,
  a.first_activity_at,
  a.last_activity_at,
  a.lab_started_at,
  a.capstone_started_at,
  a.meaningful_interaction_at,
  a.failure_tradeoff_observed_at,
  a.capstone_completed_at,
  a.lab_started,
  a.capstone_started,
  a.meaningful_interaction,
  a.failure_tradeoff_observed,
  a.capstone_completed,
  a.event_count,
  a.session_count,
  (f.feedback_id is not null) as feedback_submitted,
  f.feedback_id,
  f.locale as feedback_locale,
  f.rating as feedback_rating,
  f.strong_aha,
  f.submitted_at as feedback_submitted_at
from event_agg a
left join first_start s using (cohort_id, anonymous_user_id, lab_id)
left join public.validation_feedback_latest_v1 f using (cohort_id, anonymous_user_id, lab_id);

create or replace view public.validation_participant_facts_v1
with (security_invoker = true) as
with events as (
  select * from public.validation_product_events_v1
),
first_event as (
  select distinct on (cohort_id, anonymous_user_id)
    cohort_id,
    anonymous_user_id,
    event_ts as first_seen_at,
    session_id as first_session_id,
    locale as first_locale,
    page_type as first_page_type,
    path as first_path,
    utm_source as acquisition_utm_source,
    utm_medium as acquisition_utm_medium,
    utm_campaign as acquisition_utm_campaign,
    first_utm_source as lifetime_first_utm_source,
    referrer as acquisition_referrer,
    device_class as first_device_class
  from events
  order by cohort_id, anonymous_user_id, event_ts, id
),
event_agg as (
  select
    e.cohort_id,
    e.anonymous_user_id,
    min(e.event_ts) as first_seen_at,
    max(e.event_ts) as last_seen_at,
    count(*) as event_count,
    count(distinct e.session_id) as session_count,
    min(e.event_ts) filter (where e.name = 'landing_viewed') as first_landing_viewed_at,
    min(e.event_ts) filter (where e.name = 'lab_started') as first_lab_started_at,
    count(distinct e.lab_id) filter (where e.name = 'lab_started' and e.lab_id <> '') as labs_started,
    count(distinct e.layer) filter (where e.name = 'lab_started' and e.layer <> '') as layers_started,
    count(distinct e.lab_id) filter (where e.name = 'meaningful_interaction' and e.lab_id <> '') as meaningful_labs,
    count(distinct e.lab_id) filter (where e.name = 'failure_tradeoff_observed' and e.lab_id <> '') as failure_tradeoff_labs,
    bool_or(e.name = 'capstone_started') as capstone_started,
    bool_or(e.name = 'capstone_completed') as capstone_completed,
    bool_or(e.name = 'pricing_viewed') as pricing_viewed,
    bool_or(e.name = 'paid_intent_clicked') as paid_intent_clicked,
    bool_or(e.name = 'waitlist_submitted') as waitlist_submitted
  from events e
  group by e.cohort_id, e.anonymous_user_id
),
returns as (
  select
    a.cohort_id,
    a.anonymous_user_id,
    min(e.event_ts) filter (
      where e.session_id <> f.first_session_id
        and e.event_ts >= f.first_seen_at
    ) as first_return_at,
    min(e.event_ts) filter (
      where e.event_ts >= f.first_seen_at + interval '7 days'
        and e.event_ts < f.first_seen_at + interval '8 days'
    ) as d7_return_at
  from event_agg a
  join first_event f using (cohort_id, anonymous_user_id)
  join events e using (cohort_id, anonymous_user_id)
  group by a.cohort_id, a.anonymous_user_id
),
feedback_agg as (
  select
    cohort_id,
    anonymous_user_id,
    count(*) as feedback_labs,
    count(*) filter (where strong_aha) as strong_aha_labs
  from public.validation_feedback_latest_v1
  group by cohort_id, anonymous_user_id
)
select
  a.cohort_id,
  a.anonymous_user_id,
  f.first_seen_at,
  a.last_seen_at,
  f.first_session_id,
  a.session_count,
  a.event_count,
  f.first_locale,
  f.first_page_type,
  f.first_path,
  f.acquisition_utm_source,
  f.acquisition_utm_medium,
  f.acquisition_utm_campaign,
  f.lifetime_first_utm_source,
  f.acquisition_referrer,
  f.first_device_class,
  a.first_landing_viewed_at,
  a.first_lab_started_at,
  a.labs_started,
  a.layers_started,
  a.meaningful_labs,
  a.failure_tradeoff_labs,
  (a.labs_started >= 2) as second_lab,
  (a.layers_started >= 2) as second_layer,
  (a.meaningful_labs >= 2) as two_meaningful_labs,
  a.capstone_started,
  a.capstone_completed,
  a.pricing_viewed,
  a.paid_intent_clicked,
  a.waitlist_submitted,
  (a.session_count >= 2) as any_return,
  r.first_return_at,
  r.d7_return_at,
  coalesce(g.feedback_labs, 0) as feedback_labs,
  coalesce(g.strong_aha_labs, 0) as strong_aha_labs,
  (coalesce(g.strong_aha_labs, 0) > 0) as has_strong_aha
from event_agg a
join first_event f using (cohort_id, anonymous_user_id)
left join returns r using (cohort_id, anonymous_user_id)
left join feedback_agg g using (cohort_id, anonymous_user_id);

create or replace function public.validation_product_metrics_v1(
  p_cohort_id text,
  p_window_start timestamptz,
  p_window_end timestamptz
)
returns table (
  metric_key text,
  numerator bigint,
  denominator bigint,
  rate numeric
)
language sql
stable
as $$
with events as (
  select *
  from public.validation_product_events_v1
  where cohort_id = p_cohort_id
    and event_ts >= p_window_start
    and event_ts < p_window_end
),
participant_rollup as (
  select
    anonymous_user_id,
    min(event_ts) as first_seen_at,
    min(event_ts) filter (where name = 'landing_viewed') as first_landing_at,
    min(event_ts) filter (where name = 'lab_started') as first_lab_started_at,
    count(distinct session_id) as session_count,
    count(distinct lab_id) filter (where name = 'lab_started' and lab_id <> '') as labs_started,
    count(distinct layer) filter (where name = 'lab_started' and layer <> '') as layers_started,
    count(distinct lab_id) filter (where name = 'meaningful_interaction' and lab_id <> '') as meaningful_labs,
    bool_or(name = 'capstone_started') as capstone_started,
    bool_or(name = 'capstone_completed') as capstone_completed,
    bool_or(name = 'pricing_viewed') as pricing_viewed,
    bool_or(name = 'paid_intent_clicked') as paid_intent_clicked,
    bool_or(name = 'waitlist_submitted') as waitlist_submitted
  from events
  group by anonymous_user_id
),
d7 as (
  select
    p.anonymous_user_id,
    min(e.event_ts) filter (
      where e.event_ts >= p.first_seen_at + interval '7 days'
        and e.event_ts < p.first_seen_at + interval '8 days'
    ) as d7_return_at
  from participant_rollup p
  left join events e using (anonymous_user_id)
  group by p.anonymous_user_id, p.first_seen_at
),
user_labs as (
  select
    anonymous_user_id,
    lab_id,
    bool_or(name = 'lab_started') as lab_started,
    bool_or(name = 'meaningful_interaction') as meaningful_interaction,
    bool_or(name = 'failure_tradeoff_observed') as failure_tradeoff_observed
  from events
  where lab_id <> ''
  group by anonymous_user_id, lab_id
),
feedback_window as (
  select distinct on (anonymous_user_id, lab_id)
    anonymous_user_id,
    lab_id,
    strong_aha
  from public.aha_feedback
  where cohort_id = p_cohort_id
    and cohort_id <> 'production-smoke'
    and submitted_at >= p_window_start
    and submitted_at < p_window_end
  order by anonymous_user_id, lab_id, submitted_at desc, id desc
),
counts as (
  select 'unique_cohort_visitors'::text as metric_key,
         count(*)::bigint as numerator,
         null::bigint as denominator
  from participant_rollup

  union all
  select 'landing_to_lab_start',
         count(*) filter (where first_landing_at is not null and first_lab_started_at >= first_landing_at)::bigint,
         count(*) filter (where first_landing_at is not null)::bigint
  from participant_rollup

  union all
  select 'meaningful_interaction_rate',
         count(*) filter (where lab_started and meaningful_interaction)::bigint,
         count(*) filter (where lab_started)::bigint
  from user_labs

  union all
  select 'failure_tradeoff_exposure_rate',
         count(*) filter (where lab_started and failure_tradeoff_observed)::bigint,
         count(*) filter (where lab_started)::bigint
  from user_labs

  union all
  select 'strong_aha_rate',
         count(*) filter (where strong_aha)::bigint,
         count(*)::bigint
  from feedback_window

  union all
  select 'second_lab_rate',
         count(*) filter (where labs_started >= 2)::bigint,
         count(*) filter (where labs_started >= 1)::bigint
  from participant_rollup

  union all
  select 'second_layer_rate',
         count(*) filter (where layers_started >= 2)::bigint,
         count(*) filter (where labs_started >= 1)::bigint
  from participant_rollup

  union all
  select 'two_meaningful_labs_rate',
         count(*) filter (where meaningful_labs >= 2)::bigint,
         count(*) filter (where labs_started >= 1)::bigint
  from participant_rollup

  union all
  select 'capstone_start_rate',
         count(*) filter (where capstone_started)::bigint,
         count(*) filter (where labs_started >= 1)::bigint
  from participant_rollup

  union all
  select 'capstone_completion_rate',
         count(*) filter (where capstone_completed)::bigint,
         count(*) filter (where capstone_started)::bigint
  from participant_rollup

  union all
  select 'pricing_visit_rate',
         count(*) filter (where pricing_viewed)::bigint,
         count(*)::bigint
  from participant_rollup

  union all
  select 'paid_intent_rate',
         count(*) filter (where paid_intent_clicked)::bigint,
         count(*)::bigint
  from participant_rollup

  union all
  select 'waitlist_conversion_rate',
         count(*) filter (where waitlist_submitted)::bigint,
         count(*)::bigint
  from participant_rollup

  union all
  select 'any_return_rate',
         count(*) filter (where session_count >= 2)::bigint,
         count(*)::bigint
  from participant_rollup

  union all
  select 'd7_return_rate',
         count(*) filter (
           where p.first_seen_at < p_window_end - interval '7 days'
             and d.d7_return_at is not null
         )::bigint,
         count(*) filter (where p.first_seen_at < p_window_end - interval '7 days')::bigint
  from participant_rollup p
  left join d7 d using (anonymous_user_id)
)
select
  metric_key,
  numerator,
  denominator,
  case
    when denominator is null or denominator = 0 then null
    else numerator::numeric / denominator::numeric
  end as rate
from counts
order by metric_key;
$$;

create or replace view public.validation_data_quality_issues_v1
with (security_invoker = true) as
select
  'ERROR'::text as severity,
  'meaningful_without_start'::text as issue_code,
  e.cohort_id,
  e.anonymous_user_id,
  e.lab_id,
  e.event_ts as observed_at,
  'meaningful_interaction has no prior cohort-scoped Lab/capstone start'::text as detail
from public.validation_product_events_v1 e
where e.name = 'meaningful_interaction'
  and not exists (
    select 1 from public.validation_product_events_v1 s
    where s.cohort_id = e.cohort_id
      and s.anonymous_user_id = e.anonymous_user_id
      and s.lab_id = e.lab_id
      and s.name in ('lab_started', 'capstone_started')
      and s.event_ts <= e.event_ts
  )

union all
select
  'ERROR',
  'tradeoff_without_meaningful',
  e.cohort_id,
  e.anonymous_user_id,
  e.lab_id,
  e.event_ts,
  'failure_tradeoff_observed has no prior meaningful_interaction'
from public.validation_product_events_v1 e
where e.name = 'failure_tradeoff_observed'
  and not exists (
    select 1 from public.validation_product_events_v1 m
    where m.cohort_id = e.cohort_id
      and m.anonymous_user_id = e.anonymous_user_id
      and m.lab_id = e.lab_id
      and m.name = 'meaningful_interaction'
      and m.event_ts <= e.event_ts
  )

union all
select
  'ERROR',
  'capstone_complete_without_start',
  e.cohort_id,
  e.anonymous_user_id,
  e.lab_id,
  e.event_ts,
  'capstone_completed has no prior capstone_started'
from public.validation_product_events_v1 e
where e.name = 'capstone_completed'
  and not exists (
    select 1 from public.validation_product_events_v1 s
    where s.cohort_id = e.cohort_id
      and s.anonymous_user_id = e.anonymous_user_id
      and s.lab_id = e.lab_id
      and s.name = 'capstone_started'
      and s.event_ts <= e.event_ts
  )

union all
select
  'ERROR',
  'strong_aha_mismatch',
  f.cohort_id,
  f.anonymous_user_id,
  f.lab_id,
  f.submitted_at,
  'strong_aha must exactly match rating in yes|aha'
from public.aha_feedback f
where f.cohort_id <> 'production-smoke'
  and f.strong_aha is distinct from (f.rating in ('yes', 'aha'))

union all
select
  'WARNING',
  'duplicate_feedback_user_lab',
  f.cohort_id,
  f.anonymous_user_id,
  f.lab_id,
  max(f.submitted_at),
  'multiple feedback rows exist for one cohort/user/lab; metrics use latest response'
from public.aha_feedback f
where f.cohort_id <> 'production-smoke'
group by f.cohort_id, f.anonymous_user_id, f.lab_id
having count(*) > 1

union all
select
  'WARNING',
  'semantic_lab_event_missing_identity',
  e.cohort_id,
  e.anonymous_user_id,
  e.lab_id,
  e.event_ts,
  'semantic Lab event is missing lab_id or layer'
from public.validation_product_events_v1 e
where e.name in ('lab_started', 'meaningful_interaction', 'failure_tradeoff_observed', 'capstone_started', 'capstone_completed')
  and (e.lab_id = '' or e.layer = '')

union all
select
  'WARNING',
  'feedback_without_start',
  f.cohort_id,
  f.anonymous_user_id,
  f.lab_id,
  f.submitted_at,
  'feedback has no prior cohort-scoped Lab/capstone start in persisted events'
from public.aha_feedback f
where f.cohort_id <> 'production-smoke'
  and not exists (
    select 1 from public.validation_product_events_v1 s
    where s.cohort_id = f.cohort_id
      and s.anonymous_user_id = f.anonymous_user_id
      and s.lab_id = f.lab_id
      and s.name in ('lab_started', 'capstone_started')
      and s.event_ts <= f.submitted_at
  )

union all
select
  'WARNING',
  'participant_locale_changed',
  e.cohort_id,
  e.anonymous_user_id,
  ''::text,
  max(e.event_ts),
  'participant used multiple locales; locale slices are non-additive'
from public.validation_product_events_v1 e
group by e.cohort_id, e.anonymous_user_id
having count(distinct e.locale) > 1

union all
select
  'WARNING',
  'waitlist_without_success_event',
  w.cohort_id,
  w.anonymous_user_id,
  w.lab_id,
  w.updated_at,
  'durable waitlist contact has no matching waitlist_submitted event for cohort/user'
from public.validation_waitlist w
where w.cohort_id <> 'production-smoke'
  and w.cohort_id <> ''
  and w.anonymous_user_id <> ''
  and not exists (
    select 1 from public.validation_product_events_v1 e
    where e.cohort_id = w.cohort_id
      and e.anonymous_user_id = w.anonymous_user_id
      and e.name = 'waitlist_submitted'
  );

revoke all on public.validation_product_events_v1 from public, anon, authenticated;
revoke all on public.validation_feedback_latest_v1 from public, anon, authenticated;
revoke all on public.validation_user_lab_facts_v1 from public, anon, authenticated;
revoke all on public.validation_participant_facts_v1 from public, anon, authenticated;
revoke all on public.validation_data_quality_issues_v1 from public, anon, authenticated;
revoke all on function public.validation_product_metrics_v1(text, timestamptz, timestamptz) from public, anon, authenticated;

grant select on public.validation_product_events_v1 to service_role;
grant select on public.validation_feedback_latest_v1 to service_role;
grant select on public.validation_user_lab_facts_v1 to service_role;
grant select on public.validation_participant_facts_v1 to service_role;
grant select on public.validation_data_quality_issues_v1 to service_role;
grant execute on function public.validation_product_metrics_v1(text, timestamptz, timestamptz) to service_role;
