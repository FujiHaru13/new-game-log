-- new-game-log initial schema
-- Apply once to a new Supabase project. Do not run against a database containing
-- an existing version of this schema without a reviewed migration.

create extension if not exists pgcrypto;

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
  constraint matches_stadium_ck check (
    stadium_id is not null or nullif(trim(stadium_custom_name), '') is not null
  ),
  constraint matches_teams_distinct_ck check (home_team_id <> away_team_id),
  constraint matches_owner_legacy_unique unique (owner_id, legacy_id)
);

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

create table public.watch_record_categories (
  owner_id uuid not null references auth.users(id) on delete cascade,
  watch_record_id uuid not null references public.watch_records(id) on delete cascade,
  category_id text not null references public.categories(id) on delete restrict,
  is_primary boolean not null default false,
  primary key (watch_record_id, category_id)
);

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

create trigger matches_set_updated_at before update on public.matches
for each row execute function public.set_updated_at();
create trigger watch_records_set_updated_at before update on public.watch_records
for each row execute function public.set_updated_at();
create trigger tickets_set_updated_at before update on public.tickets
for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments
for each row execute function public.set_updated_at();
