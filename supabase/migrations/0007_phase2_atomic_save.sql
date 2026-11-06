-- Phase 2A: atomic persistence for match detail data.
-- Apply only after 0001-0006. This migration does not modify existing rows.

alter table public.match_inning_scores
  add column if not exists is_not_played boolean not null default false;

create table if not exists public.payment_splits (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  watch_record_id uuid not null,
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  paid_date date,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_splits_watch_owner_fk
    foreign key (watch_record_id, owner_id)
    references public.watch_records(id, owner_id) on delete cascade
);

create index if not exists payment_splits_owner_watch_idx
  on public.payment_splits (owner_id, watch_record_id);

drop trigger if exists payment_splits_set_updated_at on public.payment_splits;
create trigger payment_splits_set_updated_at
before update on public.payment_splits
for each row execute function public.set_updated_at();

alter table public.payment_splits enable row level security;
revoke all on public.payment_splits from public, anon;
grant select, insert, update, delete on public.payment_splits to authenticated;

drop policy if exists payment_splits_owner_all on public.payment_splits;
create policy payment_splits_owner_all on public.payment_splits
for all to authenticated
using (
  owner_id = auth.uid()
  and public.current_user_is_authorized()
  and exists (
    select 1 from public.watch_records w
    where w.id = watch_record_id and w.owner_id = auth.uid()
  )
)
with check (
  owner_id = auth.uid()
  and public.current_user_is_authorized()
  and exists (
    select 1 from public.watch_records w
    where w.id = watch_record_id and w.owner_id = auth.uid()
  )
);

create or replace function public.save_match_record(p_payload jsonb)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = public, pg_catalog
as $function$
declare
  v_owner_id uuid := auth.uid();
  v_match_id uuid;
  v_watch_id uuid;
  v_existing_owner uuid;
  v_ticket_id uuid;
  v_match jsonb := p_payload -> 'match';
  v_watch jsonb := p_payload -> 'watch';
  v_replace jsonb := coalesce(p_payload -> 'replace', '{}'::jsonb);
  v_value jsonb;
  v_index integer;
  v_home_value jsonb;
  v_away_value jsonb;
  v_player text;
  v_role text;
begin
  if v_owner_id is null or not public.current_user_is_authorized() then
    raise exception using errcode = '42501', message = 'authorized user is required';
  end if;
  if jsonb_typeof(v_match) <> 'object' or nullif(v_match ->> 'id', '') is null then
    raise exception using errcode = '22023', message = 'match.id is required';
  end if;

  v_match_id := (v_match ->> 'id')::uuid;
  select owner_id into v_existing_owner
  from public.matches
  where id = v_match_id
  for update;
  if found and v_existing_owner <> v_owner_id then
    raise exception using errcode = '42501', message = 'match belongs to another owner';
  end if;

  insert into public.matches (
    id, owner_id, match_date, date_unknown, start_time,
    home_team_id, away_team_id, stadium_id, stadium_custom_name,
    match_type, match_status, home_score, away_score, score_confirmed,
    duration_minutes, events, notes
  )
  values (
    v_match_id, v_owner_id, nullif(v_match ->> 'match_date', '')::date,
    coalesce((v_match ->> 'date_unknown')::boolean, false),
    nullif(v_match ->> 'start_time', '')::time,
    v_match ->> 'home_team_id', v_match ->> 'away_team_id',
    nullif(v_match ->> 'stadium_id', ''), nullif(v_match ->> 'stadium_custom_name', ''),
    v_match ->> 'match_type', v_match ->> 'match_status',
    (v_match ->> 'home_score')::integer, (v_match ->> 'away_score')::integer,
    coalesce((v_match ->> 'score_confirmed')::boolean, false),
    (v_match ->> 'duration_minutes')::integer,
    nullif(v_match ->> 'events', ''), nullif(v_match ->> 'notes', '')
  )
  on conflict (id) do update set
    match_date = excluded.match_date,
    date_unknown = excluded.date_unknown,
    start_time = excluded.start_time,
    home_team_id = excluded.home_team_id,
    away_team_id = excluded.away_team_id,
    stadium_id = excluded.stadium_id,
    stadium_custom_name = excluded.stadium_custom_name,
    match_type = excluded.match_type,
    match_status = excluded.match_status,
    home_score = excluded.home_score,
    away_score = excluded.away_score,
    score_confirmed = excluded.score_confirmed,
    duration_minutes = excluded.duration_minutes,
    events = excluded.events,
    notes = excluded.notes;

  if jsonb_typeof(v_watch) = 'object' then
    select id into v_watch_id from public.watch_records where match_id = v_match_id for update;
    if v_watch_id is null then
      insert into public.watch_records (
        owner_id, match_id, watch_status, cheer_team_id, companions, watch_memo,
        total_price, my_expense, payment_date, payment_destination, payment_method,
        cost_memo, refund_amount, refund_status
      )
      values (
        v_owner_id, v_match_id, v_watch ->> 'watch_status', v_watch ->> 'cheer_team_id',
        nullif(v_watch ->> 'companions', ''), nullif(v_watch ->> 'watch_memo', ''),
        (v_watch ->> 'total_price')::numeric, (v_watch ->> 'my_expense')::numeric,
        nullif(v_watch ->> 'payment_date', '')::date, nullif(v_watch ->> 'payment_destination', ''),
        nullif(v_watch ->> 'payment_method', ''), nullif(v_watch ->> 'cost_memo', ''),
        (v_watch ->> 'refund_amount')::numeric,
        coalesce(nullif(v_watch ->> 'refund_status', ''), 'none')
      )
      returning id into v_watch_id;
    else
      update public.watch_records set
        watch_status = v_watch ->> 'watch_status',
        cheer_team_id = v_watch ->> 'cheer_team_id',
        companions = nullif(v_watch ->> 'companions', ''),
        watch_memo = nullif(v_watch ->> 'watch_memo', ''),
        total_price = (v_watch ->> 'total_price')::numeric,
        my_expense = (v_watch ->> 'my_expense')::numeric,
        payment_date = nullif(v_watch ->> 'payment_date', '')::date,
        payment_destination = nullif(v_watch ->> 'payment_destination', ''),
        payment_method = nullif(v_watch ->> 'payment_method', ''),
        cost_memo = nullif(v_watch ->> 'cost_memo', ''),
        refund_amount = (v_watch ->> 'refund_amount')::numeric,
        refund_status = coalesce(nullif(v_watch ->> 'refund_status', ''), 'none')
      where id = v_watch_id and owner_id = v_owner_id;
    end if;
  end if;

  if v_watch_id is null then
    raise exception using errcode = '22023', message = 'watch data is required';
  end if;

  if coalesce((v_replace ->> 'categories')::boolean, false) then
    delete from public.watch_record_categories where watch_record_id = v_watch_id;
    for v_value in select * from jsonb_array_elements(coalesce(p_payload -> 'categories', '[]'::jsonb)) loop
      insert into public.watch_record_categories (owner_id, watch_record_id, category_id, is_primary)
      values (v_owner_id, v_watch_id, v_value ->> 'id', coalesce((v_value ->> 'is_primary')::boolean, false));
    end loop;
  end if;

  if coalesce((v_replace ->> 'seat')::boolean, false) then
    delete from public.seats where watch_record_id = v_watch_id;
    v_value := p_payload -> 'seat';
    if jsonb_typeof(v_value) = 'object' and (
      nullif(v_value ->> 'seat_type_id', '') is not null
      or nullif(v_value ->> 'custom_seat_type_name', '') is not null
      or nullif(v_value ->> 'area', '') is not null
      or nullif(v_value ->> 'seat_row', '') is not null
      or nullif(v_value ->> 'seat_number', '') is not null
    ) then
      insert into public.seats (
        owner_id, watch_record_id, seat_type_id, custom_seat_type_name, area, seat_row, seat_number
      )
      values (
        v_owner_id, v_watch_id, nullif(v_value ->> 'seat_type_id', ''),
        nullif(v_value ->> 'custom_seat_type_name', ''), nullif(v_value ->> 'area', ''),
        nullif(v_value ->> 'seat_row', ''), nullif(v_value ->> 'seat_number', '')
      );
    end if;
  end if;

  if coalesce((v_replace ->> 'ticket')::boolean, false) then
    v_value := p_payload -> 'ticket';
    if jsonb_typeof(v_value) = 'object' then
      select id into v_ticket_id from public.tickets
      where match_id = v_match_id and owner_id = v_owner_id
      for update;
      if v_ticket_id is null then
        insert into public.tickets (
          owner_id, match_id, status, release_date, purchase_date, issue_date,
          payment_deadline, quantity, seat_type_name, seat_area, seat_row, seat_number,
          ticket_type, vendor, notes
        )
        values (
          v_owner_id, v_match_id, v_value ->> 'status',
          nullif(v_value ->> 'release_date', '')::date, nullif(v_value ->> 'purchase_date', '')::date,
          nullif(v_value ->> 'issue_date', '')::date, nullif(v_value ->> 'payment_deadline', '')::date,
          (v_value ->> 'quantity')::integer, nullif(v_value ->> 'seat_type_name', ''),
          nullif(v_value ->> 'seat_area', ''), nullif(v_value ->> 'seat_row', ''),
          nullif(v_value ->> 'seat_number', ''), nullif(v_value ->> 'ticket_type', ''),
          nullif(v_value ->> 'vendor', ''), nullif(v_value ->> 'notes', '')
        );
      else
        update public.tickets set
          status = v_value ->> 'status',
          release_date = nullif(v_value ->> 'release_date', '')::date,
          purchase_date = nullif(v_value ->> 'purchase_date', '')::date,
          issue_date = nullif(v_value ->> 'issue_date', '')::date,
          payment_deadline = nullif(v_value ->> 'payment_deadline', '')::date,
          quantity = (v_value ->> 'quantity')::integer,
          ticket_type = nullif(v_value ->> 'ticket_type', ''),
          vendor = nullif(v_value ->> 'vendor', ''),
          notes = nullif(v_value ->> 'notes', '')
        where id = v_ticket_id and owner_id = v_owner_id;
      end if;
    elsif p_payload ? 'ticket' then
      delete from public.tickets where match_id = v_match_id and owner_id = v_owner_id;
    end if;
  end if;

  if coalesce((v_replace ->> 'innings')::boolean, false) then
    delete from public.match_inning_scores where match_id = v_match_id;
    for v_index in 1..greatest(
      coalesce(jsonb_array_length(p_payload #> '{innings,home}'), 0),
      coalesce(jsonb_array_length(p_payload #> '{innings,away}'), 0)
    ) loop
      v_home_value := p_payload #> array['innings', 'home', (v_index - 1)::text];
      v_away_value := p_payload #> array['innings', 'away', (v_index - 1)::text];
      if v_home_value is not null or v_away_value is not null then
        insert into public.match_inning_scores (match_id, inning_number, side, runs, is_not_played)
        values
          (v_match_id, v_index, 'home',
           case when v_home_value = '"X"' then null else nullif(v_home_value #>> '{}', '')::integer end,
           v_home_value = '"X"'),
          (v_match_id, v_index, 'away',
           case when v_away_value = '"X"' then null else nullif(v_away_value #>> '{}', '')::integer end,
           false);
      end if;
    end loop;
    insert into public.match_team_totals (match_id, side, hits, errors)
    values
      (v_match_id, 'home', (p_payload #>> '{innings,homeHits}')::integer, (p_payload #>> '{innings,homeErrors}')::integer),
      (v_match_id, 'away', (p_payload #>> '{innings,awayHits}')::integer, (p_payload #>> '{innings,awayErrors}')::integer)
    on conflict (match_id, side) do update set hits = excluded.hits, errors = excluded.errors;
  end if;

  if coalesce((v_replace ->> 'pitchers')::boolean, false) then
    delete from public.match_pitchers where match_id = v_match_id;
    foreach v_role in array['homeStarter', 'awayStarter', 'winningPitcher', 'losingPitcher', 'savePitcher'] loop
      v_player := nullif(p_payload #>> array['pitchers', v_role], '');
      if v_player is not null then
        insert into public.match_pitchers (match_id, side, role, player_name)
        values (
          v_match_id,
          case when v_role = 'homeStarter' then 'home' when v_role = 'awayStarter' then 'away' else null end,
          case v_role when 'homeStarter' then 'starter' when 'awayStarter' then 'starter'
            when 'winningPitcher' then 'winning' when 'losingPitcher' then 'losing' else 'save' end,
          v_player
        );
      end if;
    end loop;
  end if;

  if coalesce((v_replace ->> 'events')::boolean, false) then
    delete from public.match_events where match_id = v_match_id;
    v_index := 0;
    for v_value in select * from jsonb_array_elements(coalesce(p_payload -> 'home_runs', '[]'::jsonb)) loop
      v_index := v_index + 1;
      insert into public.match_events (match_id, event_type, player_name, description, event_order)
      values (v_match_id, 'home_run', nullif(v_value #>> '{}', ''), v_value #>> '{}', v_index);
    end loop;
    if nullif(p_payload ->> 'events', '') is not null then
      insert into public.match_events (match_id, event_type, description, event_order)
      values (v_match_id, 'other', p_payload ->> 'events', v_index + 1);
    end if;
  end if;

  if coalesce((v_replace ->> 'links')::boolean, false) then
    delete from public.match_links where match_id = v_match_id;
    for v_value in select * from jsonb_array_elements(coalesce(p_payload -> 'links', '[]'::jsonb)) loop
      insert into public.match_links (match_id, title, url)
      values (v_match_id, v_value ->> 'title', v_value ->> 'url');
    end loop;
  end if;

  if coalesce((v_replace ->> 'splits')::boolean, false) then
    delete from public.payment_splits where watch_record_id = v_watch_id;
    for v_value in select * from jsonb_array_elements(coalesce(p_payload -> 'splits', '[]'::jsonb)) loop
      insert into public.payment_splits (owner_id, watch_record_id, title, amount, paid_date, memo)
      values (
        v_owner_id, v_watch_id, v_value ->> 'title', (v_value ->> 'amount')::numeric,
        nullif(v_value ->> 'paid_date', '')::date, nullif(v_value ->> 'memo', '')
      );
    end loop;
  end if;

  return jsonb_build_object(
    'ok', true,
    'match_id', v_match_id,
    'watch_record_id', v_watch_id
  );
end;
$function$;

revoke execute on function public.save_match_record(jsonb) from public, anon;
grant execute on function public.save_match_record(jsonb) to authenticated;
