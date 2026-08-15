\set ON_ERROR_STOP on

begin;
set timezone = 'UTC';

-- Good cohort fixture: four participants with deliberately different behavior.
insert into public.validation_events (
  event_id, anonymous_user_id, session_id, cohort_id, locale, name, props,
  path, event_ts, page_type, layer, lab_id, lab_version,
  utm_source, utm_medium, utm_campaign, device_class
) values
  ('p1-land', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'landing_viewed', '{}', '/en/', '2026-01-01T00:00:00Z', 'landing', 'Overview', '', '', 'github', 'invite', 'alpha', 'desktop'),
  ('p1-a-start', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'lab_started', '{}', '/en/labs/a/', '2026-01-01T00:10:00Z', 'lab', 'Prompt', 'lab-a', '1.0.0', 'github', 'invite', 'alpha', 'desktop'),
  ('p1-a-meaning', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'meaningful_interaction', '{}', '/en/labs/a/', '2026-01-01T00:11:00Z', 'lab', 'Prompt', 'lab-a', '1.0.0', 'github', 'invite', 'alpha', 'desktop'),
  ('p1-a-trade', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'failure_tradeoff_observed', '{}', '/en/labs/a/', '2026-01-01T00:12:00Z', 'lab', 'Prompt', 'lab-a', '1.0.0', 'github', 'invite', 'alpha', 'desktop'),
  ('p1-b-start', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'lab_started', '{}', '/en/labs/b/', '2026-01-01T00:20:00Z', 'lab', 'Context', 'lab-b', '1.0.0', 'github', 'invite', 'alpha', 'desktop'),
  ('p1-b-meaning', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'meaningful_interaction', '{}', '/en/labs/b/', '2026-01-01T00:21:00Z', 'lab', 'Context', 'lab-b', '1.0.0', 'github', 'invite', 'alpha', 'desktop'),
  ('p1-b-trade', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'failure_tradeoff_observed', '{}', '/en/labs/b/', '2026-01-01T00:22:00Z', 'lab', 'Context', 'lab-b', '1.0.0', 'github', 'invite', 'alpha', 'desktop'),
  ('p1-cap-start', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'capstone_started', '{}', '/en/build/reliable-support-agent/', '2026-01-01T00:30:00Z', 'capstone', 'Integrated', 'reliable-support-agent', '2.0.0', 'github', 'invite', 'alpha', 'desktop'),
  ('p1-cap-done', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'capstone_completed', '{}', '/en/build/reliable-support-agent/', '2026-01-01T00:31:00Z', 'capstone', 'Integrated', 'reliable-support-agent', '2.0.0', 'github', 'invite', 'alpha', 'desktop'),
  ('p1-price', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'pricing_viewed', '{}', '/en/pricing/', '2026-01-01T00:40:00Z', 'pricing', 'Commercial', '', '', 'github', 'invite', 'alpha', 'desktop'),
  ('p1-paid', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'paid_intent_clicked', '{}', '/en/pricing/', '2026-01-01T00:41:00Z', 'pricing', 'Commercial', '', '', 'github', 'invite', 'alpha', 'desktop'),
  ('p1-wait', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'waitlist_submitted', '{}', '/en/early-access/', '2026-01-01T00:42:00Z', 'waitlist', 'Commercial', '', '', 'github', 'invite', 'alpha', 'desktop'),
  ('p1-return', 'p1', 'p1-s2', 'fixture-alpha', 'en', 'landing_viewed', '{}', '/en/', '2026-01-02T00:00:00Z', 'landing', 'Overview', '', '', '', '', '', 'desktop'),
  ('p1-d7', 'p1', 'p1-s3', 'fixture-alpha', 'en', 'pricing_viewed', '{}', '/en/pricing/', '2026-01-08T00:00:00Z', 'pricing', 'Commercial', '', '', '', '', '', 'desktop'),

  ('p2-land', 'p2', 'p2-s1', 'fixture-alpha', 'en', 'landing_viewed', '{}', '/en/', '2026-01-01T01:00:00Z', 'landing', 'Overview', '', '', 'direct', '', '', 'mobile'),
  ('p2-a-start', 'p2', 'p2-s1', 'fixture-alpha', 'en', 'lab_started', '{}', '/en/labs/a/', '2026-01-01T01:10:00Z', 'lab', 'Prompt', 'lab-a', '1.0.0', 'direct', '', '', 'mobile'),
  ('p2-a-meaning', 'p2', 'p2-s1', 'fixture-alpha', 'en', 'meaningful_interaction', '{}', '/en/labs/a/', '2026-01-01T01:11:00Z', 'lab', 'Prompt', 'lab-a', '1.0.0', 'direct', '', '', 'mobile'),
  ('p2-return', 'p2', 'p2-s2', 'fixture-alpha', 'en', 'lab_viewed', '{}', '/en/labs/a/', '2026-01-02T01:00:00Z', 'lab', 'Prompt', 'lab-a', '1.0.0', '', '', '', 'mobile'),

  ('p3-land', 'p3', 'p3-s1', 'fixture-alpha', 'zh-CN', 'landing_viewed', '{}', '/zh-cn/', '2026-01-01T02:00:00Z', 'landing', 'Overview', '', '', 'x', 'social', 'alpha', 'tablet'),
  ('p3-price', 'p3', 'p3-s1', 'fixture-alpha', 'zh-CN', 'pricing_viewed', '{}', '/zh-cn/pricing/', '2026-01-01T02:10:00Z', 'pricing', 'Commercial', '', '', 'x', 'social', 'alpha', 'tablet'),

  ('p4-a-start', 'p4', 'p4-s1', 'fixture-alpha', 'zh-CN', 'lab_started', '{}', '/zh-cn/labs/a/', '2026-01-01T03:00:00Z', 'lab', 'Prompt', 'lab-a', '1.0.0', 'reddit', 'social', 'alpha', 'desktop');

insert into public.aha_feedback (
  feedback_id, anonymous_user_id, session_id, cohort_id, locale, layer, lab_id,
  lab_version, path, rating, strong_aha, note, submitted_at, device_class
) values
  ('p1-fa', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'Prompt', 'lab-a', '1.0.0', '/en/labs/a/', 'yes', true, '', '2026-01-01T00:13:00Z', 'desktop'),
  ('p1-fb', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'Context', 'lab-b', '1.0.0', '/en/labs/b/', 'aha', true, '', '2026-01-01T00:23:00Z', 'desktop'),
  ('p2-fa-old', 'p2', 'p2-s1', 'fixture-alpha', 'en', 'Prompt', 'lab-a', '1.0.0', '/en/labs/a/', 'yes', true, '', '2026-01-01T01:12:00Z', 'mobile'),
  ('p2-fa-new', 'p2', 'p2-s1', 'fixture-alpha', 'en', 'Prompt', 'lab-a', '1.0.0', '/en/labs/a/', 'no', false, '', '2026-01-01T01:13:00Z', 'mobile'),
  ('p4-fa', 'p4', 'p4-s1', 'fixture-alpha', 'zh-CN', 'Prompt', 'lab-a', '1.0.0', '/zh-cn/labs/a/', 'little', false, '', '2026-01-01T03:05:00Z', 'desktop');

insert into public.validation_waitlist (
  email, intent, source, anonymous_user_id, session_id, cohort_id, locale, layer,
  utm_source, utm_medium, utm_campaign, device_class
) values
  ('p1@example.invalid', 'alpha', '/en/early-access/', 'p1', 'p1-s1', 'fixture-alpha', 'en', 'Commercial', 'github', 'invite', 'alpha', 'desktop');

-- Smoke data must remain in raw storage but never enter product read models.
insert into public.validation_events (
  event_id, anonymous_user_id, session_id, cohort_id, locale, name, props, path, event_ts
) values
  ('smoke-fixture', 'smoke-user', 'smoke-session', 'production-smoke', 'zh-CN', 'production_smoke_test', '{}', '/zh-cn/', '2026-01-01T00:00:00Z');

-- Deliberately invalid semantic fixture for data-quality assertions.
insert into public.validation_events (
  event_id, anonymous_user_id, session_id, cohort_id, locale, name, props,
  path, event_ts, page_type, layer, lab_id, lab_version
) values
  ('bad-meaning', 'bad1', 'bad1-s1', 'fixture-bad', 'en', 'meaningful_interaction', '{}', '/en/labs/x/', '2026-01-01T00:00:00Z', 'lab', 'Prompt', 'lab-x', '1.0.0'),
  ('bad-trade', 'bad2', 'bad2-s1', 'fixture-bad', 'en', 'failure_tradeoff_observed', '{}', '/en/labs/y/', '2026-01-01T00:00:00Z', 'lab', 'Context', 'lab-y', '1.0.0'),
  ('bad-cap', 'bad3', 'bad3-s1', 'fixture-bad', 'en', 'capstone_completed', '{}', '/en/build/reliable-support-agent/', '2026-01-01T00:00:00Z', 'capstone', 'Integrated', 'reliable-support-agent', '2.0.0');

insert into public.aha_feedback (
  feedback_id, anonymous_user_id, session_id, cohort_id, locale, layer, lab_id,
  lab_version, path, rating, strong_aha, note, submitted_at, device_class
) values
  ('bad-feedback', 'bad4', 'bad4-s1', 'fixture-bad', 'en', 'Prompt', 'lab-z', '1.0.0', '/en/labs/z/', 'no', true, '', '2026-01-01T00:00:00Z', 'desktop');

insert into public.validation_waitlist (
  email, intent, source, anonymous_user_id, session_id, cohort_id, locale, layer
) values
  ('bad@example.invalid', 'alpha', '/en/early-access/', 'bad5', 'bad5-s1', 'fixture-bad', 'en', 'Commercial');

create temporary table expected_metrics (
  metric_key text primary key,
  numerator bigint not null,
  denominator bigint
) on commit drop;

insert into expected_metrics values
  ('unique_cohort_visitors', 4, null),
  ('landing_to_lab_start', 2, 3),
  ('meaningful_interaction_rate', 3, 4),
  ('failure_tradeoff_exposure_rate', 2, 4),
  ('strong_aha_rate', 2, 4),
  ('second_lab_rate', 1, 3),
  ('second_layer_rate', 1, 3),
  ('two_meaningful_labs_rate', 1, 3),
  ('capstone_start_rate', 1, 3),
  ('capstone_completion_rate', 1, 1),
  ('pricing_visit_rate', 2, 4),
  ('paid_intent_rate', 1, 4),
  ('waitlist_conversion_rate', 1, 4),
  ('any_return_rate', 2, 4),
  ('d7_return_rate', 1, 4);

do $$
declare
  expected record;
  actual record;
begin
  for expected in select * from expected_metrics order by metric_key loop
    select * into actual
    from public.validation_product_metrics_v1(
      'fixture-alpha',
      '2026-01-01T00:00:00Z'::timestamptz,
      '2026-01-10T00:00:00Z'::timestamptz
    )
    where metric_key = expected.metric_key;

    if not found then
      raise exception 'missing metric %', expected.metric_key;
    end if;
    if actual.numerator is distinct from expected.numerator then
      raise exception 'metric % numerator expected %, got %', expected.metric_key, expected.numerator, actual.numerator;
    end if;
    if actual.denominator is distinct from expected.denominator then
      raise exception 'metric % denominator expected %, got %', expected.metric_key, expected.denominator, actual.denominator;
    end if;
  end loop;
end $$;

-- Participant facts must derive cohort-scoped continuation and retention.
do $$
declare
  fact record;
begin
  select * into fact
  from public.validation_participant_facts_v1
  where cohort_id = 'fixture-alpha' and anonymous_user_id = 'p1';

  if fact.labs_started <> 2 or fact.layers_started <> 2 or fact.meaningful_labs <> 2 then
    raise exception 'p1 participant breadth facts are incorrect: %', row_to_json(fact);
  end if;
  if not fact.second_lab or not fact.second_layer or not fact.two_meaningful_labs then
    raise exception 'p1 continuation facts are incorrect: %', row_to_json(fact);
  end if;
  if not fact.any_return or fact.d7_return_at is null then
    raise exception 'p1 retention facts are incorrect: %', row_to_json(fact);
  end if;
end $$;

-- Latest feedback per user × Lab must prevent repeated feedback from overweighting Aha.
do $$
declare
  fact record;
begin
  select * into fact
  from public.validation_feedback_latest_v1
  where cohort_id = 'fixture-alpha' and anonymous_user_id = 'p2' and lab_id = 'lab-a';

  if fact.feedback_id <> 'p2-fa-new' or fact.rating <> 'no' or fact.strong_aha then
    raise exception 'latest feedback dedup is incorrect: %', row_to_json(fact);
  end if;
end $$;

-- Smoke rows are stored but excluded from product evidence.
do $$
declare
  n bigint;
begin
  select count(*) into n
  from public.validation_product_events_v1
  where cohort_id = 'production-smoke';
  if n <> 0 then
    raise exception 'production-smoke leaked into validation_product_events_v1';
  end if;

  select numerator into n
  from public.validation_product_metrics_v1(
    'production-smoke',
    '2026-01-01T00:00:00Z'::timestamptz,
    '2026-01-10T00:00:00Z'::timestamptz
  )
  where metric_key = 'unique_cohort_visitors';
  if n <> 0 then
    raise exception 'production-smoke leaked into metrics';
  end if;
end $$;

-- Good cohort has no ERROR-level semantic violations.
do $$
declare
  n bigint;
begin
  select count(*) into n
  from public.validation_data_quality_issues_v1
  where cohort_id = 'fixture-alpha' and severity = 'ERROR';
  if n <> 0 then
    raise exception 'fixture-alpha unexpectedly has % ERROR quality issues', n;
  end if;
end $$;

-- Invalid fixture must surface the semantic violations instead of silently aggregating them.
do $$
declare
  missing text[];
begin
  select array_agg(code order by code) into missing
  from (
    select code
    from unnest(array[
      'meaningful_without_start',
      'tradeoff_without_meaningful',
      'capstone_complete_without_start',
      'strong_aha_mismatch',
      'feedback_without_start',
      'waitlist_without_success_event'
    ]) code
    where not exists (
      select 1
      from public.validation_data_quality_issues_v1 q
      where q.cohort_id = 'fixture-bad' and q.issue_code = code
    )
  ) x;

  if missing is not null then
    raise exception 'missing expected data-quality issues: %', missing;
  end if;
end $$;

-- Duplicate feedback is a warning and does not change the latest-response metric grain.
do $$
declare
  n bigint;
begin
  select count(*) into n
  from public.validation_data_quality_issues_v1
  where cohort_id = 'fixture-alpha'
    and anonymous_user_id = 'p2'
    and lab_id = 'lab-a'
    and issue_code = 'duplicate_feedback_user_lab';
  if n <> 1 then
    raise exception 'expected one duplicate-feedback warning for p2/lab-a, got %', n;
  end if;
end $$;

rollback;
