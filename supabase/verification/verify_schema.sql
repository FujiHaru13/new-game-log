-- Read-only checks. Run with an administrative role; this does not prove
-- end-user RLS behavior.

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'authorized_users', 'teams', 'categories', 'stadiums', 'seat_types',
    'stadium_seat_types', 'matches', 'watch_records', 'watch_record_categories',
    'seats', 'tickets', 'payments', 'match_inning_scores', 'match_team_totals',
    'match_pitchers', 'match_events', 'match_links', 'import_batches', 'import_rows'
  )
order by table_name;

select table_name, constraint_name, constraint_type
from information_schema.table_constraints
where table_schema = 'public'
  and table_name in ('matches', 'watch_records', 'tickets', 'payments', 'match_inning_scores')
order by table_name, constraint_name;

select
  tc.table_name, kcu.column_name, ccu.table_name as foreign_table_name, ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu on kcu.constraint_name = tc.constraint_name and kcu.table_schema = tc.table_schema
join information_schema.constraint_column_usage ccu on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public'
order by tc.table_name, kcu.column_name;

select schemaname, tablename, indexname
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;

select table_name, row_security
from pg_tables
where schemaname = 'public'
order by table_name;

select routine_name, routine_type, security_type
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('set_updated_at', 'current_user_is_authorized')
order by routine_name;

select table_name, table_type
from information_schema.views
where table_schema = 'public'
  and table_name in ('watch_record_costs', 'dashboard_match_facts', 'category_statistics')
order by table_name;

select c.relname as view_name, c.reloptions
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('watch_record_costs', 'dashboard_match_facts', 'category_statistics')
  and c.relkind = 'v'
order by c.relname;

select
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on kcu.constraint_name = tc.constraint_name and kcu.table_schema = tc.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
where tc.table_schema = 'public'
  and tc.constraint_type = 'FOREIGN KEY'
  and tc.constraint_name in (
    'authorized_users_default_cheer_team_fk',
    'watch_records_match_owner_fk',
    'watch_record_categories_owner_fk',
    'seats_owner_fk',
    'tickets_match_owner_fk',
    'payments_match_owner_fk',
    'payments_watch_record_owner_fk',
    'payments_ticket_owner_fk',
    'import_rows_batch_owner_fk'
  )
order by tc.table_name, tc.constraint_name, kcu.ordinal_position;

select 'teams' as master_name, count(*)::bigint as row_count from public.teams
union all select 'categories', count(*) from public.categories
union all select 'stadiums', count(*) from public.stadiums
union all select 'seat_types', count(*) from public.seat_types;
