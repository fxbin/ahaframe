-- Provider-independent content entitlement foundation for Knowledge Graph v1.
-- Payment providers never write curriculum semantics. A later Billing adapter may
-- only change account membership state after verified server reconciliation.

create table if not exists public.account_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  membership_status text not null default 'FREE'
    check (membership_status in ('FREE', 'MEMBER')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id text not null check (char_length(content_id) between 1 and 160),
  source text not null check (source in ('FREE_CHOICE', 'ADMIN')),
  granted_at timestamptz not null default now(),
  primary key (user_id, content_id)
);

create index if not exists content_entitlements_user_source_idx
  on public.content_entitlements (user_id, source, granted_at);

alter table public.account_access enable row level security;
alter table public.content_entitlements enable row level security;

revoke all on public.account_access from anon, authenticated;
revoke all on public.content_entitlements from anon, authenticated;
grant select on public.account_access to authenticated;
grant select on public.content_entitlements to authenticated;
grant select, insert, update, delete on public.account_access to service_role;
grant select, insert, update, delete on public.content_entitlements to service_role;

create policy account_access_select_own
  on public.account_access
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy content_entitlements_select_own
  on public.content_entitlements
  for select
  to authenticated
  using (auth.uid() = user_id);

-- The browser is intentionally unable to execute this function directly.
-- The Next.js server validates that p_content_id is classified FREE_CHOICE in
-- the canonical content-production manifest, authenticates the caller, and then
-- invokes this function with the service role. The database owns concurrency and
-- the hard maximum of three permanent free choices.
create or replace function public.claim_free_content_choice(
  p_user_id uuid,
  p_content_id text
)
returns table (
  claimed_content_id text,
  free_choices_used integer,
  free_choices_remaining integer,
  already_granted boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_membership_status text;
  v_used integer;
  v_exists boolean;
begin
  if p_user_id is null then
    raise exception using errcode = '22004', message = 'USER_ID_REQUIRED';
  end if;
  if p_content_id is null or char_length(trim(p_content_id)) = 0 then
    raise exception using errcode = '22023', message = 'CONTENT_ID_REQUIRED';
  end if;

  insert into public.account_access (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  -- Serialize claims for one account. Two concurrent requests cannot consume
  -- the same last slot or exceed the three-choice policy.
  select membership_status
    into v_membership_status
    from public.account_access
    where user_id = p_user_id
    for update;

  if v_membership_status = 'MEMBER' then
    raise exception using errcode = 'P0001', message = 'MEMBERSHIP_ALREADY_UNLOCKS_LIBRARY';
  end if;

  select exists (
    select 1
    from public.content_entitlements
    where user_id = p_user_id
      and content_id = p_content_id
  ) into v_exists;

  select count(*)::integer
    into v_used
    from public.content_entitlements
    where user_id = p_user_id
      and source = 'FREE_CHOICE';

  if v_exists then
    return query select p_content_id, v_used, greatest(0, 3 - v_used), true;
    return;
  end if;

  if v_used >= 3 then
    raise exception using errcode = 'P0001', message = 'FREE_CHOICE_LIMIT_REACHED';
  end if;

  insert into public.content_entitlements (user_id, content_id, source)
  values (p_user_id, p_content_id, 'FREE_CHOICE');

  v_used := v_used + 1;
  return query select p_content_id, v_used, greatest(0, 3 - v_used), false;
end;
$$;

revoke all on function public.claim_free_content_choice(uuid, text) from public, anon, authenticated;
grant execute on function public.claim_free_content_choice(uuid, text) to service_role;

comment on table public.account_access is
  'Provider-independent account access state. FREE vs MEMBER is not a payment-provider record.';
comment on table public.content_entitlements is
  'Permanent per-content grants such as the three FREE_CHOICE selections. Membership-wide access is derived from account_access.';
comment on function public.claim_free_content_choice(uuid, text) is
  'Server-only atomic claim. Caller must validate canonical FREE_CHOICE classification before invoking.';
