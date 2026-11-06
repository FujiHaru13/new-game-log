-- Read-only Phase 2A catalog verification. Run after 0007 in Supabase SQL Editor.
select
  to_regclass('public.payment_splits') as payment_splits_table,
  to_regclass('public.match_inning_scores') as inning_scores_table,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'match_inning_scores'
      and column_name = 'is_not_played'
  ) as has_is_not_played;

select
  p.oid::regprocedure as function_name,
  p.prosecdef as security_definer,
  has_function_privilege('public', p.oid, 'execute') as public_execute,
  has_function_privilege('anon', p.oid, 'execute') as anon_execute,
  has_function_privilege('authenticated', p.oid, 'execute') as authenticated_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'save_match_record';

select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  has_table_privilege('anon', c.oid, 'select') as anon_select,
  has_table_privilege('authenticated', c.oid, 'select') as authenticated_select
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('payment_splits', 'match_inning_scores', 'match_team_totals',
                    'match_pitchers', 'match_events', 'match_links');
