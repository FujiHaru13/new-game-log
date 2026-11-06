-- Row-level security and authorization.
-- An administrator/service-role/SQL Editor operation must insert the first row
-- into authorized_users after the Auth account has been created.

create or replace function public.current_user_is_authorized()
returns boolean
language sql
stable
security invoker
set search_path = public, pg_catalog
as $$
  select exists (
    select 1 from public.authorized_users
    where user_id = auth.uid()
  );
$$;

alter table public.authorized_users enable row level security;
alter table public.teams enable row level security;
alter table public.categories enable row level security;
alter table public.stadiums enable row level security;
alter table public.seat_types enable row level security;
alter table public.stadium_seat_types enable row level security;
alter table public.matches enable row level security;
alter table public.watch_records enable row level security;
alter table public.watch_record_categories enable row level security;
alter table public.seats enable row level security;
alter table public.tickets enable row level security;
alter table public.payments enable row level security;
alter table public.match_inning_scores enable row level security;
alter table public.match_team_totals enable row level security;
alter table public.match_pitchers enable row level security;
alter table public.match_events enable row level security;
alter table public.match_links enable row level security;
alter table public.import_batches enable row level security;
alter table public.import_rows enable row level security;

create policy authorized_users_select_self on public.authorized_users
for select to authenticated using (user_id = auth.uid());

create policy teams_select_authorized on public.teams
for select to authenticated using (public.current_user_is_authorized());
create policy teams_manage_authorized on public.teams
for all to authenticated using (public.current_user_is_authorized())
with check (public.current_user_is_authorized());
create policy categories_select_authorized on public.categories
for select to authenticated using (public.current_user_is_authorized());
create policy categories_manage_authorized on public.categories
for all to authenticated using (public.current_user_is_authorized())
with check (public.current_user_is_authorized());
create policy stadiums_select_authorized on public.stadiums
for select to authenticated using (public.current_user_is_authorized());
create policy stadiums_manage_authorized on public.stadiums
for all to authenticated using (public.current_user_is_authorized())
with check (public.current_user_is_authorized());
create policy seat_types_select_authorized on public.seat_types
for select to authenticated using (public.current_user_is_authorized());
create policy seat_types_manage_authorized on public.seat_types
for all to authenticated using (public.current_user_is_authorized())
with check (public.current_user_is_authorized());
create policy stadium_seat_types_select_authorized on public.stadium_seat_types
for select to authenticated using (public.current_user_is_authorized());
create policy stadium_seat_types_manage_authorized on public.stadium_seat_types
for all to authenticated using (public.current_user_is_authorized())
with check (public.current_user_is_authorized());

create policy matches_select_owner on public.matches
for select to authenticated using (owner_id = auth.uid() and public.current_user_is_authorized());
create policy matches_insert_authorized_owner on public.matches
for insert to authenticated
with check (owner_id = auth.uid() and public.current_user_is_authorized());
create policy matches_update_owner on public.matches
for update to authenticated using (owner_id = auth.uid() and public.current_user_is_authorized())
with check (owner_id = auth.uid() and public.current_user_is_authorized());

create policy matches_delete_owner on public.matches
for delete to authenticated using (owner_id = auth.uid() and public.current_user_is_authorized());

create policy watch_records_owner_all on public.watch_records
for all to authenticated
using (owner_id = auth.uid() and public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()))
with check (owner_id = auth.uid() and public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()));

create policy watch_record_categories_owner_all on public.watch_record_categories
for all to authenticated
using (owner_id = auth.uid() and public.current_user_is_authorized() and exists (select 1 from public.watch_records w where w.id = watch_record_id and w.owner_id = auth.uid()))
with check (owner_id = auth.uid() and public.current_user_is_authorized() and exists (select 1 from public.watch_records w where w.id = watch_record_id and w.owner_id = auth.uid()));

create policy seats_owner_all on public.seats
for all to authenticated
using (owner_id = auth.uid() and public.current_user_is_authorized() and exists (select 1 from public.watch_records w where w.id = watch_record_id and w.owner_id = auth.uid()))
with check (owner_id = auth.uid() and public.current_user_is_authorized() and exists (select 1 from public.watch_records w where w.id = watch_record_id and w.owner_id = auth.uid()));

create policy tickets_owner_all on public.tickets
for all to authenticated
using (owner_id = auth.uid() and public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()))
with check (owner_id = auth.uid() and public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()));

create policy payments_owner_all on public.payments
for all to authenticated
using (owner_id = auth.uid() and public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()))
with check (
  owner_id = auth.uid() and public.current_user_is_authorized()
  and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid())
  and (watch_record_id is null or exists (select 1 from public.watch_records w where w.id = watch_record_id and w.owner_id = auth.uid() and w.match_id = match_id))
  and (ticket_id is null or exists (select 1 from public.tickets t where t.id = ticket_id and t.owner_id = auth.uid() and t.match_id = match_id))
);

create policy match_inning_scores_owner_all on public.match_inning_scores
for all to authenticated using (public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()))
with check (public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()));
create policy match_team_totals_owner_all on public.match_team_totals
for all to authenticated using (public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()))
with check (public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()));
create policy match_pitchers_owner_all on public.match_pitchers
for all to authenticated using (public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()))
with check (public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()));
create policy match_events_owner_all on public.match_events
for all to authenticated using (public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()))
with check (public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()));
create policy match_links_owner_all on public.match_links
for all to authenticated using (public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()))
with check (public.current_user_is_authorized() and exists (select 1 from public.matches m where m.id = match_id and m.owner_id = auth.uid()));

create policy import_batches_owner_all on public.import_batches
for all to authenticated using (owner_id = auth.uid() and public.current_user_is_authorized())
with check (owner_id = auth.uid() and public.current_user_is_authorized());
create policy import_rows_owner_all on public.import_rows
for all to authenticated using (owner_id = auth.uid() and public.current_user_is_authorized() and exists (select 1 from public.import_batches b where b.id = batch_id and b.owner_id = auth.uid()))
with check (owner_id = auth.uid() and public.current_user_is_authorized() and exists (select 1 from public.import_batches b where b.id = batch_id and b.owner_id = auth.uid()));

revoke all on public.authorized_users from authenticated;
grant usage on schema public to authenticated;
grant select on public.teams, public.categories, public.stadiums, public.seat_types, public.stadium_seat_types to authenticated;
grant select on public.authorized_users to authenticated;
grant select, insert, update, delete on public.teams, public.categories, public.stadiums, public.seat_types, public.stadium_seat_types to authenticated;
grant select, insert, update, delete on public.matches, public.watch_records, public.watch_record_categories, public.seats, public.tickets, public.payments, public.match_inning_scores, public.match_team_totals, public.match_pitchers, public.match_events, public.match_links, public.import_batches, public.import_rows to authenticated;
revoke all on function public.current_user_is_authorized() from public;
grant execute on function public.current_user_is_authorized() to authenticated;
revoke all on function public.set_updated_at() from public;
grant execute on function public.set_updated_at() to authenticated;
revoke all on function public.check_import_row_match_owners() from public;
