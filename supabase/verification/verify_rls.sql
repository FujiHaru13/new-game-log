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
