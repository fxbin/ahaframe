\set ON_ERROR_STOP on

insert into auth.users (id) values
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222')
on conflict do nothing;

-- Browser roles can only read their own entitlement state. They cannot forge
-- grants or invoke the privileged claim RPC directly.
do $$
begin
  if has_table_privilege('authenticated', 'public.account_access', 'INSERT') then
    raise exception 'authenticated must not insert account_access';
  end if;
  if has_table_privilege('authenticated', 'public.content_entitlements', 'INSERT') then
    raise exception 'authenticated must not insert content_entitlements';
  end if;
  if has_function_privilege('authenticated', 'public.claim_free_content_choice(uuid,text)', 'EXECUTE') then
    raise exception 'authenticated must not execute claim_free_content_choice';
  end if;
  if not has_function_privilege('service_role', 'public.claim_free_content_choice(uuid,text)', 'EXECUTE') then
    raise exception 'service_role must execute claim_free_content_choice';
  end if;
end;
$$;

set role service_role;
select * from public.claim_free_content_choice('11111111-1111-1111-1111-111111111111', 'rag-failure');
select * from public.claim_free_content_choice('11111111-1111-1111-1111-111111111111', 'agent-reliability');
select * from public.claim_free_content_choice('11111111-1111-1111-1111-111111111111', 'ai-code-review-mission');

-- Re-claiming the same content is idempotent and does not consume a fourth slot.
do $$
declare
  v_used integer;
  v_remaining integer;
  v_already boolean;
begin
  select free_choices_used, free_choices_remaining, already_granted
    into v_used, v_remaining, v_already
    from public.claim_free_content_choice('11111111-1111-1111-1111-111111111111', 'rag-failure');
  if v_used <> 3 or v_remaining <> 0 or v_already is not true then
    raise exception 're-claim must be idempotent: used %, remaining %, already %', v_used, v_remaining, v_already;
  end if;
end;
$$;

-- The fourth distinct claim is rejected even when requests race at the account
-- boundary; the function serializes claims by locking account_access.
do $$
begin
  begin
    perform * from public.claim_free_content_choice('11111111-1111-1111-1111-111111111111', 'research-evidence-mission');
    raise exception 'fourth free choice unexpectedly succeeded';
  exception
    when others then
      if sqlerrm <> 'FREE_CHOICE_LIMIT_REACHED' then
        raise;
      end if;
  end;
end;
$$;

reset role;

do $$
declare
  v_count integer;
begin
  select count(*)::integer into v_count
  from public.content_entitlements
  where user_id = '11111111-1111-1111-1111-111111111111'
    and source = 'FREE_CHOICE';
  if v_count <> 3 then
    raise exception 'expected exactly 3 permanent FREE_CHOICE grants, got %', v_count;
  end if;
end;
$$;

-- RLS exposes only the current authenticated user's rows.
insert into public.account_access (user_id) values ('22222222-2222-2222-2222-222222222222') on conflict do nothing;
insert into public.content_entitlements (user_id, content_id, source)
values ('22222222-2222-2222-2222-222222222222', 'other-user-content', 'ADMIN')
on conflict do nothing;

set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

do $$
declare
  v_accounts integer;
  v_grants integer;
begin
  select count(*)::integer into v_accounts from public.account_access;
  select count(*)::integer into v_grants from public.content_entitlements;
  if v_accounts <> 1 then
    raise exception 'RLS account_access leaked rows: %', v_accounts;
  end if;
  if v_grants <> 3 then
    raise exception 'RLS content_entitlements leaked rows: %', v_grants;
  end if;
end;
$$;

reset role;
select set_config('request.jwt.claim.sub', '', false);

\echo 'PASS Content Entitlements: own-row RLS, server-only claim RPC, idempotent permanent grants, atomic three-choice maximum.'
