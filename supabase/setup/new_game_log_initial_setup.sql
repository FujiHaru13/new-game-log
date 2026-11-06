-- new-game-log initial setup package
-- Generated from migrations in application order.
-- Apply this file once in a new Supabase project inside one transaction.
BEGIN;

-- ===== BEGIN SOURCE: supabase/migrations/0001_initial_schema.sql =====
-- new-game-log initial schema
-- Apply once to a new Supabase project. Do not run against a database containing
-- an existing version of this schema without a reviewed migration.

create extension if not exists pgcrypto;

-- Keep the API roles out of public objects until the RLS migration is complete.
-- The SQL Editor/service role remains able to create the schema.
revoke usage on schema public from public, anon, authenticated;

create table public.authorized_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_cheer_team_id text not null default 'dragons',
  approved_at timestamptz not null default now(),
  approved_by uuid references auth.users(id),
  note text
);

create table public.teams (
  id text primary key,
  name text not null,
  short_name text not null,
  code text not null unique,
  color text,
  text_color text,
  league text not null check (league in ('central', 'pacific', 'western', 'eastern', 'japan', 'other')),
  league_name text not null,
  display_order integer not null default 0
);

create table public.categories (
  id text primary key,
  label text not null,
  short_label text not null,
  display_order integer not null default 0,
  is_active boolean not null default true
);
create table public.stadiums (
  id text primary key,
  name text not null,
  short_name text not null,
  location text,
  home_team_id text references public.teams(id) on delete set null,
  is_dome boolean not null default false,
  display_order integer not null default 0,
  is_active boolean not null default true
);
alter table public.authorized_users
  add constraint authorized_users_default_cheer_team_fk
  foreign key (default_cheer_team_id) references public.teams(id) on delete restrict;

create table public.seat_types (
  id text primary key,
  name text not null,
  display_name text not null,
  category text not null check (category in ('infield', 'outfield', 'premium', 'box', 'other')),
  price_range text,
  display_order integer not null default 0,
  is_active boolean not null default true
);

create table public.stadium_seat_types (
  stadium_id text not null references public.stadiums(id) on delete cascade,
  seat_type_id text not null references public.seat_types(id) on delete restrict,
  primary key (stadium_id, seat_type_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  legacy_id text,
  match_date date,
  date_unknown boolean not null default false,
  start_time time,
  home_team_id text not null references public.teams(id) on delete restrict,
  away_team_id text not null references public.teams(id) on delete restrict,
  stadium_id text references public.stadiums(id) on delete restrict,
  stadium_custom_name text,
  match_type text not null check (match_type in ('official', 'interleague', 'open', 'climax', 'nippon_series', 'practice', 'international', 'other')),
  match_status text not null default 'scheduled' check (match_status in ('scheduled', 'finished', 'cancelled', 'in_progress', 'postponed')),
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  score_confirmed boolean not null default false,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  events text,
  notes text,
  source_document text,
  source_row_number integer check (source_row_number is null or source_row_number > 0),
  source_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_date_state_ck check (
    (date_unknown and match_date is null) or (not date_unknown and match_date is not null)
  ),
  constraint matches_score_confirmation_ck check (
    not score_confirmed or (home_score is not null and away_score is not null)
  ),
  constraint matches_teams_distinct_ck check (home_team_id <> away_team_id),
  constraint matches_owner_legacy_unique unique (owner_id, legacy_id)
);
alter table public.matches add constraint matches_id_owner_unique unique (id, owner_id);

create table public.watch_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null unique references public.matches(id) on delete cascade,
  watch_status text not null default 'scheduled' check (watch_status in ('watched', 'scheduled', 'cancelled')),
  cheer_team_id text not null references public.teams(id) on delete restrict,
  companions text,
  watch_memo text,
  total_price numeric(12,2) check (total_price is null or total_price >= 0),
  my_expense numeric(12,2) check (my_expense is null or my_expense >= 0),
  payment_date date,
  payment_destination text,
  payment_method text,
  cost_memo text,
  refund_amount numeric(12,2) check (refund_amount is null or refund_amount >= 0),
  refund_status text not null default 'none' check (refund_status in ('none', 'pending', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.watch_records add constraint watch_records_id_owner_unique unique (id, owner_id);
alter table public.watch_records add constraint watch_records_match_id_owner_unique
  unique (match_id, id, owner_id);
alter table public.watch_records add constraint watch_records_match_owner_fk
  foreign key (match_id, owner_id) references public.matches(id, owner_id) on delete cascade;

create table public.watch_record_categories (
  owner_id uuid not null references auth.users(id) on delete cascade,
  watch_record_id uuid not null references public.watch_records(id) on delete cascade,
  category_id text not null references public.categories(id) on delete restrict,
  is_primary boolean not null default false,
  primary key (watch_record_id, category_id)
);
alter table public.watch_record_categories add constraint watch_record_categories_owner_fk
  foreign key (watch_record_id, owner_id) references public.watch_records(id, owner_id) on delete cascade;

create unique index watch_record_one_primary_category_idx
  on public.watch_record_categories (watch_record_id)
  where is_primary;

create table public.seats (
  owner_id uuid not null references auth.users(id) on delete cascade,
  watch_record_id uuid primary key references public.watch_records(id) on delete cascade,
  seat_type_id text references public.seat_types(id) on delete set null,
  custom_seat_type_name text,
  area text,
  seat_row text,
  seat_number text
);
alter table public.seats add constraint seats_owner_fk
  foreign key (watch_record_id, owner_id) references public.watch_records(id, owner_id) on delete cascade;

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  status text not null default 'release_waiting' check (status in ('release_waiting', 'plan_to_buy', 'purchased', 'ticket_waiting', 'ticketed', 'cancelled_refund')),
  release_date date,
  purchase_date date,
  issue_date date,
  payment_deadline date,
  quantity integer check (quantity is null or quantity > 0),
  seat_type_name text,
  seat_area text,
  seat_row text,
  seat_number text,
  ticket_type text,
  vendor text,
  purchase_amount numeric(12,2) check (purchase_amount is null or purchase_amount >= 0),
  my_expense numeric(12,2) check (my_expense is null or my_expense >= 0),
  refund_amount numeric(12,2) check (refund_amount is null or refund_amount >= 0),
  refund_status text not null default 'none' check (refund_status in ('none', 'pending', 'completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tickets add constraint tickets_id_owner_unique unique (id, owner_id);
alter table public.tickets add constraint tickets_match_id_owner_unique
  unique (match_id, id, owner_id);
alter table public.tickets add constraint tickets_match_owner_fk
  foreign key (match_id, owner_id) references public.matches(id, owner_id) on delete cascade;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  watch_record_id uuid references public.watch_records(id) on delete cascade,
  ticket_id uuid references public.tickets(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  paid_date date,
  payment_destination text,
  payment_method text,
  memo text,
  refund_amount numeric(12,2) check (refund_amount is null or refund_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_target_ck check (watch_record_id is not null or ticket_id is not null)
);
alter table public.payments add constraint payments_match_owner_fk
  foreign key (match_id, owner_id) references public.matches(id, owner_id) on delete cascade;
alter table public.payments add constraint payments_watch_record_match_owner_fk
  foreign key (match_id, watch_record_id, owner_id)
  references public.watch_records(match_id, id, owner_id) on delete cascade;
alter table public.payments add constraint payments_ticket_match_owner_fk
  foreign key (match_id, ticket_id, owner_id)
  references public.tickets(match_id, id, owner_id) on delete cascade;

create table public.match_inning_scores (
  match_id uuid not null references public.matches(id) on delete cascade,
  inning_number integer not null check (inning_number > 0),
  side text not null check (side in ('home', 'away')),
  runs integer check (runs is null or runs >= 0),
  primary key (match_id, inning_number, side)
);

create table public.match_team_totals (
  match_id uuid not null references public.matches(id) on delete cascade,
  side text not null check (side in ('home', 'away')),
  hits integer check (hits is null or hits >= 0),
  errors integer check (errors is null or errors >= 0),
  primary key (match_id, side)
);

create table public.match_pitchers (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  side text check (side is null or side in ('home', 'away')),
  role text not null check (role in ('starter', 'winning', 'losing', 'save', 'other')),
  player_name text not null,
  notes text
);

create table public.match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  event_type text not null check (event_type in ('home_run', 'other')),
  side text check (side is null or side in ('home', 'away')),
  player_name text,
  description text not null,
  event_order integer check (event_order is null or event_order > 0)
);

create table public.match_links (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  title text not null,
  url text not null check (url ~* '^https?://')
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_filename text,
  source_type text not null check (source_type in ('excel', 'json', 'csv', 'manual', 'other')),
  imported_at timestamptz not null default now(),
  notes text
);

create table public.import_rows (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  batch_id uuid not null references public.import_batches(id) on delete cascade,
  sheet_name text,
  source_row_number integer check (source_row_number is null or source_row_number > 0),
  source_key text,
  raw_payload jsonb not null,
  target_match_id uuid references public.matches(id) on delete set null,
  duplicate_of_match_id uuid references public.matches(id) on delete set null
);
alter table public.import_batches add constraint import_batches_id_owner_unique unique (id, owner_id);
alter table public.import_rows add constraint import_rows_batch_owner_fk
  foreign key (batch_id, owner_id) references public.import_batches(id, owner_id) on delete cascade;

-- Keep the API roles and PUBLIC unable to reach newly-created tables until
-- 0002 has installed RLS and restored only the intended authenticated grants.
revoke all on public.authorized_users, public.teams, public.categories, public.stadiums,
  public.seat_types, public.stadium_seat_types, public.matches, public.watch_records,
  public.watch_record_categories, public.seats, public.tickets, public.payments,
  public.match_inning_scores, public.match_team_totals, public.match_pitchers,
  public.match_events, public.match_links, public.import_batches, public.import_rows
  from public, anon, authenticated;

create index matches_owner_date_idx on public.matches (owner_id, match_date);
create index matches_owner_status_idx on public.matches (owner_id, match_status);
create index matches_owner_stadium_idx on public.matches (owner_id, stadium_id);
create index watch_records_owner_status_idx on public.watch_records (owner_id, watch_status);
create index watch_record_categories_category_idx on public.watch_record_categories (owner_id, category_id);
create index tickets_owner_status_idx on public.tickets (owner_id, status);
create index tickets_owner_release_date_idx on public.tickets (owner_id, release_date);
create index payments_owner_match_idx on public.payments (owner_id, match_id);
create index inning_scores_match_idx on public.match_inning_scores (match_id, inning_number);
create index import_rows_batch_idx on public.import_rows (owner_id, batch_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.check_import_row_match_owners()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  if new.target_match_id is not null and not exists (
    select 1 from public.matches m
    where m.id = new.target_match_id and m.owner_id = new.owner_id
  ) then
    raise exception 'target_match_id must belong to owner_id';
  end if;
  if new.duplicate_of_match_id is not null and not exists (
    select 1 from public.matches m
    where m.id = new.duplicate_of_match_id and m.owner_id = new.owner_id
  ) then
    raise exception 'duplicate_of_match_id must belong to owner_id';
  end if;
  return new;
end;
$$;

create trigger import_rows_check_match_owners
before insert or update on public.import_rows
for each row execute function public.check_import_row_match_owners();

create trigger matches_set_updated_at before update on public.matches
for each row execute function public.set_updated_at();
create trigger watch_records_set_updated_at before update on public.watch_records
for each row execute function public.set_updated_at();
create trigger tickets_set_updated_at before update on public.tickets
for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments
for each row execute function public.set_updated_at();

-- ===== END SOURCE: supabase/migrations/0001_initial_schema.sql =====

-- ===== BEGIN SOURCE: supabase/migrations/0002_rls_policies.sql =====
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

revoke all on all tables in schema public from anon;
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

-- ===== END SOURCE: supabase/migrations/0002_rls_policies.sql =====

-- ===== BEGIN SOURCE: supabase/migrations/0003_views_functions.sql =====
-- Read-only application views. security_invoker makes underlying-table RLS
-- apply to the caller instead of turning the view into a data bypass.

create or replace view public.watch_record_costs
with (security_invoker = true)
as
select
  w.id as watch_record_id,
  w.owner_id,
  w.total_price,
  w.my_expense,
  coalesce(sum(p.amount) filter (where p.ticket_id is null), 0)::numeric(12,2) as direct_payment_total,
  coalesce(sum(p.amount), 0)::numeric(12,2) as payment_detail_total,
  coalesce(sum(p.refund_amount), 0)::numeric(12,2) as payment_refund_total
from public.watch_records w
left join public.payments p on p.watch_record_id = w.id
group by w.id, w.owner_id, w.total_price, w.my_expense;

create or replace view public.dashboard_match_facts
with (security_invoker = true)
as
select
  m.id as match_id,
  m.owner_id,
  m.match_date,
  m.date_unknown,
  m.start_time,
  m.home_team_id,
  m.away_team_id,
  m.stadium_id,
  m.stadium_custom_name,
  m.match_type,
  m.match_status,
  m.home_score,
  m.away_score,
  m.score_confirmed,
  w.id as watch_record_id,
  w.watch_status,
  w.cheer_team_id,
  case
    when m.match_status = 'cancelled' or w.watch_status = 'cancelled' then 'cancelled'
    when m.match_status = 'postponed' then 'postponed'
    when m.match_status <> 'finished' or m.home_score is null or m.away_score is null then 'scheduled'
    when w.cheer_team_id = m.home_team_id and m.home_score > m.away_score then 'win'
    when w.cheer_team_id = m.home_team_id and m.home_score < m.away_score then 'loss'
    when w.cheer_team_id = m.away_team_id and m.away_score > m.home_score then 'win'
    when w.cheer_team_id = m.away_team_id and m.away_score < m.home_score then 'loss'
    when w.cheer_team_id = m.home_team_id or w.cheer_team_id = m.away_team_id then 'draw'
    else 'unknown'
  end as watch_result,
  w.my_expense
from public.matches m
join public.watch_records w on w.match_id = m.id;

create or replace view public.category_statistics
with (security_invoker = true)
as
select
  c.id as category_id,
  c.label,
  f.owner_id,
  count(*) filter (where f.match_status = 'finished') as finished_matches,
  count(*) filter (where f.watch_result = 'win') as wins,
  count(*) filter (where f.watch_result = 'loss') as losses,
  count(*) filter (where f.watch_result = 'draw') as draws,
  count(*) filter (where f.watch_result in ('win', 'loss')) as decisions,
  case when count(*) filter (where f.watch_result in ('win', 'loss')) = 0 then null
       else count(*) filter (where f.watch_result = 'win')::numeric
          / count(*) filter (where f.watch_result in ('win', 'loss')) end as win_rate
from public.categories c
join public.watch_record_categories wc on wc.category_id = c.id
join public.dashboard_match_facts f on f.watch_record_id = wc.watch_record_id
group by c.id, c.label, f.owner_id;

revoke all on public.watch_record_costs, public.dashboard_match_facts, public.category_statistics from anon;
grant select on public.watch_record_costs, public.dashboard_match_facts, public.category_statistics to authenticated;

-- ===== END SOURCE: supabase/migrations/0003_views_functions.sql =====

-- ===== BEGIN SOURCE: supabase/migrations/0004_seed_master_data.sql =====
-- Master data only. No matches, tickets, payments, or user rows are inserted.

insert into public.categories (id, label, short_label, display_order)
values
  ('dragons_1st', '中日ドラゴンズ 1軍', '中日1軍', 1),
  ('dragons_2nd', '中日ドラゴンズ 2軍（ウエスタン）', '中日2軍', 2),
  ('japan', '侍ジャパン（日本代表）', '日本代表', 3),
  ('other', 'その他野球（他球団・アマ等）', 'その他', 4);

insert into public.teams (id, name, short_name, code, color, text_color, league, league_name, display_order)
values
  ('dragons', '中日ドラゴンズ', '中日', 'D', '#003882', '#ffffff', 'central', 'セ・リーグ', 1),
  ('tigers', '阪神タイガース', '阪神', 'T', '#FFE200', '#000000', 'central', 'セ・リーグ', 2),
  ('giants', '読売ジャイアンツ', '巨人', 'G', '#F97709', '#ffffff', 'central', 'セ・リーグ', 3),
  ('baystars', '横浜DeNAベイスターズ', 'DeNA', 'DB', '#0055A5', '#ffffff', 'central', 'セ・リーグ', 4),
  ('carp', '広島東洋カープ', '広島', 'C', '#DF0011', '#ffffff', 'central', 'セ・リーグ', 5),
  ('swallows', '東京ヤクルトスワローズ', 'ヤクルト', 'S', '#072C61', '#ffffff', 'central', 'セ・リーグ', 6),
  ('buffaloes', 'オリックス・バファローズ', 'オリックス', 'B', '#0B2240', '#BCA75D', 'pacific', 'パ・リーグ', 7),
  ('marines', '千葉ロッテマリーンズ', 'ロッテ', 'M', '#000000', '#ffffff', 'pacific', 'パ・リーグ', 8),
  ('hawks', '福岡ソフトバンクホークス', 'ソフトバンク', 'H', '#F5C700', '#000000', 'pacific', 'パ・リーグ', 9),
  ('eagles', '東北楽天ゴールデンイーグルス', '楽天', 'E', '#860010', '#ffffff', 'pacific', 'パ・リーグ', 10),
  ('fighters', '北海道日本ハムファイターズ', '日本ハム', 'F', '#003E7E', '#ffffff', 'pacific', 'パ・リーグ', 11),
  ('lions', '埼玉西武ライオンズ', '西武', 'L', '#13294B', '#ffffff', 'pacific', 'パ・リーグ', 12),
  ('dragons_farm', '中日ドラゴンズ（2軍）', '中日2軍', 'D2', '#1656b8', '#ffffff', 'western', 'ウエスタン・リーグ', 13),
  ('hayate', 'くふうハヤテベンチャーズ静岡', 'ハヤテ', 'HY', '#008080', '#ffffff', 'western', 'ウエスタン・リーグ', 14),
  ('tigers_farm', '阪神タイガース（2軍）', '阪神2軍', 'T2', '#FFE200', '#000000', 'western', 'ウエスタン・リーグ', 15),
  ('hawks_farm', '福岡ソフトバンクホークス（2軍）', 'ソフトバンク2軍', 'H2', '#F5C700', '#000000', 'western', 'ウエスタン・リーグ', 16),
  ('buffaloes_farm', 'オリックス・バファローズ（2軍）', 'オリックス2軍', 'B2', '#0B2240', '#BCA75D', 'western', 'ウエスタン・リーグ', 17),
  ('carp_farm', '広島東洋カープ（2軍）', '広島2軍', 'C2', '#DF0011', '#ffffff', 'western', 'ウエスタン・リーグ', 18),
  ('samurai_japan', '侍ジャパン（日本代表）', '侍ジャパン', 'JPN', '#B31B1B', '#ffffff', 'japan', '日本代表', 19),
  ('team_korea', '韓国代表', '韓国', 'KOR', '#003478', '#ffffff', 'japan', '国際代表', 20),
  ('team_taiwan', 'チャイニーズ・タイペイ代表', '台湾', 'TPE', '#002F6C', '#ffffff', 'japan', '国際代表', 21),
  ('team_usa', 'アメリカ代表', 'アメリカ', 'USA', '#002868', '#ffffff', 'japan', '国際代表', 22),
  ('team_australia', 'オーストラリア代表', '豪州', 'AUS', '#00843D', '#FFCD00', 'japan', '国際代表', 23),
  ('other_team', 'その他の球団・クラブ', 'その他', 'OTH', '#64748b', '#ffffff', 'other', 'その他', 99);

insert into public.stadiums (id, name, short_name, location, home_team_id, is_dome, display_order)
values
  ('vantelin_dome', 'バンテリンドーム ナゴヤ', 'バンテリンドーム', '愛知県名古屋市東区大幸南1-1-1', 'dragons', true, 1),
  ('nagoya_stadium', 'ナゴヤ球場', 'ナゴヤ球場', '愛知県名古屋市中川区露橋2-12-1', 'dragons_farm', false, 2),
  ('koshien', '阪神甲子園球場', '甲子園', '兵庫県西宮市甲子園町1-82', 'tigers', false, 3),
  ('tokyo_dome', '東京ドーム', '東京ドーム', '東京都文京区後楽1-3-61', 'giants', true, 4),
  ('meiji_jingu', '明治神宮野球場', '神宮球場', '東京都新宿区霞ヶ丘町3-1', 'swallows', false, 5),
  ('yokohama_stadium', '横浜スタジアム', 'ハマスタ', '神奈川県横浜市中区横浜公園', 'baystars', false, 6),
  ('mazda_zoom_zoom', 'MAZDA Zoom-Zoom スタジアム広島', 'マツダスタジアム', '広島県広島市南区南蟹屋2-3-1', 'carp', false, 7),
  ('escon_field', 'ES CON FIELD HOKKAIDO', 'エスコンフィールド', '北海道北広島市Fビレッジ1番地', 'fighters', true, 8),
  ('kyocera_dome', '京セラドーム大阪', '京セラドーム', '大阪府大阪市西区千代崎3-中2-1', 'buffaloes', true, 9),
  ('paypay_dome', 'みずほPayPayドーム福岡', 'PayPayドーム', '福岡県福岡市中央区地行浜2-2-2', 'hawks', true, 10),
  ('other_stadium', 'その他球場・地方球場', '地方・その他', '全国各地', null, false, 99);

-- ===== END SOURCE: supabase/migrations/0004_seed_master_data.sql =====

COMMIT;
