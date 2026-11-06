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

select 'teams' as master_name, count(*)::bigint as row_count from public.teams
union all select 'categories', count(*) from public.categories
union all select 'stadiums', count(*) from public.stadiums
union all select 'seat_types', count(*) from public.seat_types;
