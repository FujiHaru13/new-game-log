-- Read-only Phase 2A verification. Run after 0007.
-- PASS means the catalog condition is true; these checks do not replace REST tests.

with expected(name, present) as (
  values
    ('payment_splits', to_regclass('public.payment_splits') is not null),
    ('save_match_record', to_regprocedure('public.save_match_record(jsonb)') is not null),
    ('is_not_played', exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'match_inning_scores'
        and column_name = 'is_not_played'
    ))
)
select name, case when present then 'PASS' else 'FAIL' end as result
from expected;

select
  case when c.relrowsecurity then 'PASS' else 'FAIL' end as rls_result,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  case when exists (
    select 1 from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = c.relname
      and p.policyname = 'payment_splits_owner_all'
  ) then 'PASS' else 'FAIL' end as policy_result
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'payment_splits';

select
  case when exists (
    select 1 from information_schema.table_constraints tc
    where tc.table_schema = 'public'
      and tc.table_name = 'payment_splits'
      and tc.constraint_type = 'FOREIGN KEY'
  ) then 'PASS' else 'FAIL' end as foreign_key_result,
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'match_inning_scores'
      and column_name = 'runs'
      and is_nullable = 'YES'
  ) then 'PASS' else 'FAIL' end as nullable_runs_result,
  case when exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'match_inning_scores'
      and constraint_type = 'PRIMARY KEY'
  ) then 'PASS' else 'FAIL' end as inning_key_result;

with f as (
  select p.*
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.oid = to_regprocedure('public.save_match_record(jsonb)')
)
select
  case when f.oid is not null then 'PASS' else 'FAIL' end as function_result,
  case when f.oid is not null and not f.prosecdef then 'PASS' else 'FAIL' end as security_invoker_result,
  case when f.oid is not null and not exists (
    select 1 from aclexplode(coalesce(f.proacl, acldefault('f', f.proowner))) a
    where a.grantee = 0 and a.privilege_type = 'EXECUTE'
  ) then 'PASS' else 'FAIL' end as public_acl_result,
  case when f.oid is not null and not has_function_privilege('anon', f.oid, 'execute') then 'PASS' else 'FAIL' end as anon_execute_result,
  case when f.oid is not null and has_function_privilege('authenticated', f.oid, 'execute') then 'PASS' else 'FAIL' end as authenticated_execute_result
from (select 1) expected
left join f on true;

select
  expected.table_name,
  case when c.oid is not null and c.relrowsecurity then 'PASS' else 'FAIL' end as rls_result,
  case when c.oid is not null and has_table_privilege('anon', c.oid, 'select') then 'INFO' else 'PASS' end as anon_select_note,
  case when c.oid is not null and has_table_privilege('authenticated', c.oid, 'select') then 'PASS' else 'FAIL' end as authenticated_select_result,
  case when exists (
    select 1 from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = expected.table_name
      and p.policyname = expected.policy_name
  ) then 'PASS' else 'FAIL' end as policy_result
from (values
  ('payment_splits'::name, 'payment_splits_owner_all'::name),
  ('match_inning_scores'::name, 'match_inning_scores_owner_all'::name),
  ('match_team_totals'::name, 'match_team_totals_owner_all'::name),
  ('match_pitchers'::name, 'match_pitchers_owner_all'::name),
  ('match_events'::name, 'match_events_owner_all'::name),
  ('match_links'::name, 'match_links_owner_all'::name)
) expected(table_name, policy_name)
left join pg_class c on c.relname = expected.table_name
left join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
where c.oid is null or n.nspname = 'public';

select
  case when exists (
    select 1 from pg_constraint
    where conrelid = 'public.payment_splits'::regclass
      and contype = 'f'
  ) then 'PASS' else 'FAIL' end as payment_split_fk_result,
  (select count(*) from public.matches) as existing_match_count,
  (select count(*) from public.watch_records) as existing_watch_record_count,
  (select count(*) from public.payment_splits) as payment_split_count;

-- Administrative catalog checks do not prove anonymous/unauthorized REST behavior.
-- Run verify-rls-rest.mjs with isolated users for RPC authorization and rollback tests.
