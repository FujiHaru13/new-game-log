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

select routine_name, privilege_type, grantee
from information_schema.routine_privileges
where specific_schema = 'public'
  and routine_name in ('current_user_is_authorized', 'set_updated_at', 'check_import_row_match_owners')
order by routine_name, grantee, privilege_type;
