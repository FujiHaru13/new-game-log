-- Read-only catalog checks. Execute with an administrative role.
-- Actual anonymous/authorized/unauthorized behavior must be tested with
-- separate Supabase client sessions as described in the setup guide.

select c.relname as table_name, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
order by grantee, table_name, privilege_type;

select table_schema, table_name, privilege_type
from information_schema.table_privileges
where table_schema = 'public'
  and grantee = 'anon';

select n.nspname as schema_name, r.rolname, has_schema_privilege(r.rolname, n.nspname, 'USAGE') as has_usage
from pg_roles r
cross join pg_namespace n
where r.rolname in ('anon', 'authenticated')
  and n.nspname = 'public'
order by r.rolname;

select grantee, table_schema, privilege_type
from information_schema.role_schema_grants
where table_schema = 'public'
  and grantee in ('PUBLIC', 'anon', 'authenticated')
order by grantee, privilege_type;

select
  coalesce(array_to_string(n.nspacl, ','), '<default>') as public_schema_acl,
  exists (
    select 1
    from aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) a
    where a.grantee = 0 and a.privilege_type = 'USAGE'
  ) as public_has_usage
from pg_namespace n
where n.nspname = 'public';

select
  expected.table_name,
  count(p.policyname)::integer as policy_count,
  count(p.policyname) filter (where p.cmd = 'SELECT' or p.cmd = 'ALL')::integer as select_capable,
  count(p.policyname) filter (where p.cmd = 'DELETE' or p.cmd = 'ALL')::integer as delete_capable
from (
  values
    ('matches'), ('watch_records'), ('watch_record_categories'), ('seats'),
    ('tickets'), ('payments'), ('match_inning_scores'), ('match_team_totals'),
    ('match_pitchers'), ('match_events'), ('match_links'),
    ('import_batches'), ('import_rows')
) as expected(table_name)
left join pg_policies p
  on p.schemaname = 'public' and p.tablename = expected.table_name
group by expected.table_name
order by expected.table_name;

select expected.policyname,
       expected.tablename,
       case when p.policyname is null then 'MISSING' else 'OK' end as status
from (
  values
    ('matches_select_owner', 'matches'),
    ('matches_insert_authorized_owner', 'matches'),
    ('matches_update_owner', 'matches'),
    ('matches_delete_owner', 'matches'),
    ('watch_records_owner_all', 'watch_records'),
    ('watch_record_categories_owner_all', 'watch_record_categories'),
    ('seats_owner_all', 'seats'),
    ('tickets_owner_all', 'tickets'),
    ('payments_owner_all', 'payments'),
    ('import_batches_owner_all', 'import_batches'),
    ('import_rows_owner_all', 'import_rows')
) as expected(policyname, tablename)
left join pg_policies p
  on p.schemaname = 'public'
 and p.policyname = expected.policyname
 and p.tablename = expected.tablename
order by expected.tablename, expected.policyname;

select routine_name, privilege_type, grantee
from information_schema.routine_privileges
where specific_schema = 'public'
  and routine_name in ('current_user_is_authorized', 'set_updated_at', 'check_import_row_match_owners')
order by routine_name, grantee, privilege_type;
