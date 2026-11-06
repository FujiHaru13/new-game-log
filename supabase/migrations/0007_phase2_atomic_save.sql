-- Phase 2A: atomic persistence for match detail data.
-- Apply only after 0001-0006. This migration does not modify existing rows.
begin;

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

do $migration_check$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'payment_splits'
      and column_name in ('owner_id', 'watch_record_id', 'title', 'amount')
    group by table_schema, table_name
    having count(*) = 4
  ) then
    raise exception 'payment_splits exists with an incompatible schema';
  end if;
end;
$migration_check$;

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
  v_existing_updated_at timestamptz;
  v_ticket_id uuid;
  v_ticket_count integer;
  v_match jsonb := p_payload -> 'match';
  v_watch jsonb := p_payload -> 'watch';
  v_replace jsonb := coalesce(p_payload -> 'replace', '{}'::jsonb);
  v_value jsonb;
  v_index integer;
  v_home_value jsonb;
  v_away_value jsonb;
  v_player text;
  v_role text;
  v_ticket_operation text := p_payload ->> 'ticket_operation';
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception using errcode = '22023', message = 'payload must be a JSON object';
  end if;
  if jsonb_typeof(v_replace) <> 'object' then
    raise exception using errcode = '22023', message = 'replace must be a JSON object';
  end if;
  if v_replace ? 'innings' and jsonb_typeof(p_payload -> 'innings') <> 'object' then
    raise exception using errcode = '22023', message = 'innings must be an object';
  end if;
  if v_replace ? 'pitchers' and jsonb_typeof(p_payload -> 'pitchers') <> 'object' then
    raise exception using errcode = '22023', message = 'pitchers must be an object';
  end if;
  if v_replace ? 'categories' and jsonb_typeof(p_payload -> 'categories') <> 'array' then
    raise exception using errcode = '22023', message = 'categories must be an array';
  end if;
  if v_replace ? 'links' and jsonb_typeof(p_payload -> 'links') <> 'array' then
    raise exception using errcode = '22023', message = 'links must be an array';
  end if;
  if v_replace ? 'splits' and jsonb_typeof(p_payload -> 'splits') <> 'array' then
    raise exception using errcode = '22023', message = 'splits must be an array';
  end if;
  if v_owner_id is null or not public.current_user_is_authorized() then
    raise exception using errcode = '42501', message = 'authorized user is required';
  end if;
  if jsonb_typeof(v_match) <> 'object' or nullif(v_match ->> 'id', '') is null then
    raise exception using errcode = '22023', message = 'match.id is required';
  end if;
  if exists (select 1 from jsonb_each_text(v_match) e where e.value = '') then
    raise exception using errcode = '22023', message = 'empty strings are not valid; use JSON null';
  end if;
  if jsonb_typeof(v_watch) = 'object'
     and exists (select 1 from jsonb_each_text(v_watch) e where e.value = '') then
    raise exception using errcode = '22023', message = 'empty strings are not valid; use JSON null';
  end if;
  if v_ticket_operation is not null and v_ticket_operation <> 'delete' then
    raise exception using errcode = '22023', message = 'ticket_operation must be delete';
  end if;
  if v_ticket_operation is not null
     and not coalesce((v_replace ->> 'ticket')::boolean, false) then
    raise exception using errcode = '22023', message = 'ticket_operation requires replace.ticket=true';
  end if;

  v_match_id := (v_match ->> 'id')::uuid;
  select owner_id, updated_at into v_existing_owner, v_existing_updated_at
  from public.matches
  where id = v_match_id
  for update;
  if found and v_existing_owner <> v_owner_id then
    raise exception using errcode = '42501', message = 'match belongs to another owner';
  end if;
  if found and not (v_match ? 'expected_updated_at')
     then raise exception using errcode = '40001', message = 'expected_updated_at is required for updates';
  end if;
  if found and (v_match ->> 'expected_updated_at') is null
     then raise exception using errcode = '40001', message = 'expected_updated_at cannot be null for updates';
  end if;
  if found and v_match ? 'expected_updated_at'
     and v_existing_updated_at <> (v_match ->> 'expected_updated_at')::timestamptz then
    raise exception using errcode = '40001', message = 'match was modified by another session';
  end if;

  if v_existing_owner is null then
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
    );
  else
    update public.matches set
      match_date = case when v_match ? 'match_date' then nullif(v_match ->> 'match_date', '')::date else match_date end,
      date_unknown = case when v_match ? 'date_unknown' then (v_match ->> 'date_unknown')::boolean else date_unknown end,
      start_time = case when v_match ? 'start_time' then nullif(v_match ->> 'start_time', '')::time else start_time end,
      home_team_id = case when v_match ? 'home_team_id' then v_match ->> 'home_team_id' else home_team_id end,
      away_team_id = case when v_match ? 'away_team_id' then v_match ->> 'away_team_id' else away_team_id end,
      stadium_id = case when v_match ? 'stadium_id' then nullif(v_match ->> 'stadium_id', '') else stadium_id end,
      stadium_custom_name = case when v_match ? 'stadium_custom_name' then nullif(v_match ->> 'stadium_custom_name', '') else stadium_custom_name end,
      match_type = case when v_match ? 'match_type' then v_match ->> 'match_type' else match_type end,
      match_status = case when v_match ? 'match_status' then v_match ->> 'match_status' else match_status end,
      home_score = case when v_match ? 'home_score' then (v_match ->> 'home_score')::integer else home_score end,
      away_score = case when v_match ? 'away_score' then (v_match ->> 'away_score')::integer else away_score end,
      score_confirmed = case when v_match ? 'score_confirmed' then (v_match ->> 'score_confirmed')::boolean else score_confirmed end,
      duration_minutes = case when v_match ? 'duration_minutes' then (v_match ->> 'duration_minutes')::integer else duration_minutes end,
      events = case when v_match ? 'events' then nullif(v_match ->> 'events', '') else events end,
      notes = case when v_match ? 'notes' then nullif(v_match ->> 'notes', '') else notes end
    where id = v_match_id and owner_id = v_owner_id;
  end if;

  select id into v_watch_id from public.watch_records
  where match_id = v_match_id and owner_id = v_owner_id for update;
  if jsonb_typeof(v_watch) = 'object' then
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
        watch_status = case when v_watch ? 'watch_status' then v_watch ->> 'watch_status' else watch_status end,
        cheer_team_id = case when v_watch ? 'cheer_team_id' then v_watch ->> 'cheer_team_id' else cheer_team_id end,
        companions = case when v_watch ? 'companions' then nullif(v_watch ->> 'companions', '') else companions end,
        watch_memo = case when v_watch ? 'watch_memo' then nullif(v_watch ->> 'watch_memo', '') else watch_memo end,
        total_price = case when v_watch ? 'total_price' then (v_watch ->> 'total_price')::numeric else total_price end,
        my_expense = case when v_watch ? 'my_expense' then (v_watch ->> 'my_expense')::numeric else my_expense end,
        payment_date = case when v_watch ? 'payment_date' then nullif(v_watch ->> 'payment_date', '')::date else payment_date end,
        payment_destination = case when v_watch ? 'payment_destination' then nullif(v_watch ->> 'payment_destination', '') else payment_destination end,
        payment_method = case when v_watch ? 'payment_method' then nullif(v_watch ->> 'payment_method', '') else payment_method end,
        cost_memo = case when v_watch ? 'cost_memo' then nullif(v_watch ->> 'cost_memo', '') else cost_memo end,
        refund_amount = case when v_watch ? 'refund_amount' then (v_watch ->> 'refund_amount')::numeric else refund_amount end,
        refund_status = case when v_watch ? 'refund_status' then v_watch ->> 'refund_status' else refund_status end
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
    if v_ticket_operation = 'delete' then
      if jsonb_typeof(v_value) <> 'object'
         or jsonb_typeof(v_value -> 'id') = 'null'
         or nullif(v_value ->> 'id', '') is null then
        raise exception using errcode = '22023', message = 'ticket.id is required for deletion';
      end if;
      delete from public.tickets
      where id = (v_value ->> 'id')::uuid
        and match_id = v_match_id and owner_id = v_owner_id;
      if not found then
        raise exception using errcode = '42501', message = 'ticket does not belong to this match';
      end if;
    elsif v_ticket_operation is not null then
      raise exception using errcode = '22023', message = 'unsupported ticket operation';
    end if;
    if jsonb_typeof(v_value) = 'null' then
      raise exception using errcode = '22023', message = 'ticket must be an object; use ticket.id for explicit deletion';
    elsif v_ticket_operation is null and jsonb_typeof(v_value) <> 'object' then
      raise exception using errcode = '22023', message = 'ticket must be an object';
    end if;
    if v_ticket_operation is null and jsonb_typeof(v_value) = 'object' then
      select count(*) into v_ticket_count
      from public.tickets where match_id = v_match_id and owner_id = v_owner_id;
      if v_ticket_count = 1 then
        select id into v_ticket_id from public.tickets
        where match_id = v_match_id and owner_id = v_owner_id
        for update;
      end if;
      if v_ticket_count > 1 and nullif(v_value ->> 'id', '') is null then
        raise exception using errcode = '22023', message = 'ticket.id is required when multiple tickets exist';
      end if;
      if nullif(v_value ->> 'id', '') is not null then
        v_ticket_id := (v_value ->> 'id')::uuid;
        if not exists (
          select 1 from public.tickets
          where id = v_ticket_id and match_id = v_match_id and owner_id = v_owner_id
        ) then
          raise exception using errcode = '42501', message = 'ticket does not belong to this match';
        end if;
      end if;
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
          status = case when v_value ? 'status' then v_value ->> 'status' else status end,
          release_date = case when v_value ? 'release_date' then (v_value ->> 'release_date')::date else release_date end,
          purchase_date = case when v_value ? 'purchase_date' then (v_value ->> 'purchase_date')::date else purchase_date end,
          issue_date = case when v_value ? 'issue_date' then (v_value ->> 'issue_date')::date else issue_date end,
          payment_deadline = case when v_value ? 'payment_deadline' then (v_value ->> 'payment_deadline')::date else payment_deadline end,
          quantity = case when v_value ? 'quantity' then (v_value ->> 'quantity')::integer else quantity end,
          seat_type_name = case when v_value ? 'seat_type_name' then v_value ->> 'seat_type_name' else seat_type_name end,
          seat_area = case when v_value ? 'seat_area' then v_value ->> 'seat_area' else seat_area end,
          seat_row = case when v_value ? 'seat_row' then v_value ->> 'seat_row' else seat_row end,
          seat_number = case when v_value ? 'seat_number' then v_value ->> 'seat_number' else seat_number end,
          ticket_type = case when v_value ? 'ticket_type' then v_value ->> 'ticket_type' else ticket_type end,
          vendor = case when v_value ? 'vendor' then v_value ->> 'vendor' else vendor end,
          notes = case when v_value ? 'notes' then v_value ->> 'notes' else notes end
        where id = v_ticket_id and owner_id = v_owner_id;
      end if;
    elsif p_payload ? 'ticket' and v_ticket_operation is null then
      raise exception using errcode = '22023', message = 'use ticket_operation=delete for explicit ticket deletion';
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
      if v_home_value is not null and jsonb_typeof(v_home_value) <> 'null' then
        insert into public.match_inning_scores (match_id, inning_number, side, runs, is_not_played)
        values (v_match_id, v_index, 'home',
          case when v_home_value = '"X"' then null else (v_home_value #>> '{}')::integer end,
          v_home_value = '"X"');
      end if;
      if v_away_value is not null and jsonb_typeof(v_away_value) <> 'null' then
        insert into public.match_inning_scores (match_id, inning_number, side, runs, is_not_played)
        values (v_match_id, v_index, 'away',
          (v_away_value #>> '{}')::integer, false);
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
    foreach v_role in array (array['homeStarter', 'awayStarter', 'winningPitcher', 'losingPitcher', 'savePitcher']::text[]) loop
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

commit;
