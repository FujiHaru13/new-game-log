-- Read-only checks for migration 0006_seed_seat_types.sql.
-- Execute with an administrative role after the migration is applied.

select count(*) as seat_type_count
from public.seat_types;

select count(*) as stadium_seat_type_link_count
from public.stadium_seat_types;

-- Expected after 0006: 53 seat types and 53 stadium links.
select
  (select count(*) from public.seat_types) = 53 as seat_type_count_is_expected,
  (select count(*) from public.stadium_seat_types) = 53 as link_count_is_expected;

select
  st.id,
  st.name,
  exists (
    select 1
    from public.stadium_seat_types sst
    where sst.seat_type_id = st.id
      and sst.stadium_id = 'vantelin_dome'
  ) as linked_to_vantelin_dome
from public.seat_types st
where st.id = 'dragons_ouen';

select count(*) as orphan_stadium_links
from public.stadium_seat_types sst
left join public.stadiums s on s.id = sst.stadium_id
left join public.seat_types st on st.id = sst.seat_type_id
where s.id is null or st.id is null;

select stadium_id, count(*) as seat_type_count
from public.stadium_seat_types
group by stadium_id
order by stadium_id;

select
  has_table_privilege('authenticated', 'public.seat_types', 'SELECT') as authenticated_can_select_seat_types,
  has_table_privilege('authenticated', 'public.stadium_seat_types', 'SELECT') as authenticated_can_select_stadium_links,
  has_table_privilege('anon', 'public.seat_types', 'SELECT') as anon_can_select_seat_types,
  has_table_privilege('anon', 'public.stadium_seat_types', 'SELECT') as anon_can_select_stadium_links;
