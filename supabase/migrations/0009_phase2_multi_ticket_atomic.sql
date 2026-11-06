-- Phase 2B-2B-2B: multi-ticket atomic contract. Local verification only.
-- 0001-0008 stay immutable. Reapplying 0009 preserves data and revisions.
begin;

alter table public.matches add column if not exists revision bigint not null default 0
  check (revision >= 0);

-- Database-local gate shared by RPCs and BEFORE STATEMENT DML triggers.
-- Acquire BEFORE any aggregate row/FK locks; no retry or caller-controlled bypass.
-- Deliberately coarse: all aggregate writes serialize until transaction end.
create or replace function public.match_write_gate()
returns trigger language plpgsql security invoker
set search_path = public, pg_catalog as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(1936024935, 9);
  return null;
end;
$$;

-- Replace only the matches trigger, never the shared set_updated_at function.
create or replace function public.advance_match_revision()
returns trigger language plpgsql security invoker
set search_path = public, pg_catalog as $$
begin
  if tg_op = 'INSERT' then
    new.revision := 0;
    new.updated_at := clock_timestamp();
  else
    new.revision := old.revision + 1;
    new.updated_at := greatest(clock_timestamp(), old.updated_at + interval '1 microsecond');
  end if;
  return new;
end;
$$;

drop trigger if exists matches_set_updated_at on public.matches;
create trigger matches_set_updated_at before insert or update on public.matches
for each row execute function public.advance_match_revision();

-- Resolve OLD as well as NEW parents. A cascading watch deletion is covered by
-- watch_records' own OLD.match_id even when its child cannot resolve the watch.
create or replace function public.propagate_match_revision()
returns trigger language plpgsql security invoker
set search_path = public, pg_catalog as $$
declare
  v_old jsonb;
  v_new jsonb;
  v_old_id uuid;
  v_new_id uuid;
  v_id uuid;
begin
  if tg_op <> 'INSERT' then v_old := to_jsonb(old); end if;
  if tg_op <> 'DELETE' then v_new := to_jsonb(new); end if;
  if tg_op = 'UPDATE' and v_old = v_new then return null; end if;
  if tg_argv[0] = 'match_id' then
    v_old_id := (v_old ->> 'match_id')::uuid;
    v_new_id := (v_new ->> 'match_id')::uuid;
  else
    select match_id into v_old_id from public.watch_records
      where id = (v_old ->> 'watch_record_id')::uuid;
    select match_id into v_new_id from public.watch_records
      where id = (v_new ->> 'watch_record_id')::uuid;
  end if;
  for v_id in select distinct id from unnest(array[v_old_id, v_new_id]) ids(id)
      where id is not null order by id loop
    update public.matches set revision = revision where id = v_id;
  end loop;
  return null;
end;
$$;

-- BEFORE DELETE protects v1, v2 and direct REST alike. payments DML takes the
-- same statement gate, so a concurrent payment cannot slip past this check.
create or replace function public.protect_ticket_payments()
returns trigger language plpgsql security invoker
set search_path = public, pg_catalog as $$
begin
  if exists (select 1 from public.payments where ticket_id = old.id) then
    raise exception using errcode = '23503', message = 'ticket has related payments; deletion is forbidden';
  end if;
  return old;
end;
$$;

drop trigger if exists tickets_protect_payments on public.tickets;
create trigger tickets_protect_payments before delete on public.tickets
for each row execute function public.protect_ticket_payments();

-- Reject at the parent BEFORE ROW boundary, before any FK AFTER-trigger can
-- remove a payment through another cascade path (including watch-only payments).
create or replace function public.protect_parent_payments()
returns trigger language plpgsql security invoker
set search_path = public, pg_catalog as $$
begin
  if tg_table_name = 'matches' then
    if exists (select 1 from public.payments where match_id = old.id) then
      raise exception using errcode = '23503', message = 'match has related payments; deletion is forbidden';
    end if;
  elsif tg_table_name = 'watch_records' then
    if exists (select 1 from public.payments where watch_record_id = old.id) then
      raise exception using errcode = '23503', message = 'watch record has related payments; deletion is forbidden';
    end if;
  else
    raise exception using errcode = '22023', message = 'unsupported payment protection parent';
  end if;
  return old;
end;
$$;

drop trigger if exists matches_protect_payments on public.matches;
create trigger matches_protect_payments before delete on public.matches
for each row execute function public.protect_parent_payments();
drop trigger if exists watch_records_protect_payments on public.watch_records;
create trigger watch_records_protect_payments before delete on public.watch_records
for each row execute function public.protect_parent_payments();

-- Defense in depth: FK CASCADE executes DELETE from a trigger. Deny nested
-- trigger deletes regardless of cascade order, even if another FK path has
-- already removed a parent. Top-level DELETE and ordinary function/RPC DELETE
-- remain allowed while all referenced parents exist. No user-settable bypass.
create or replace function public.protect_payment_parent_delete()
returns trigger language plpgsql security invoker
set search_path = public, pg_catalog as $$
begin
  if pg_catalog.pg_trigger_depth() > 1
     or not exists (select 1 from public.matches where id = old.match_id)
     or (old.watch_record_id is not null and not exists (
       select 1 from public.watch_records where id = old.watch_record_id and match_id = old.match_id))
     or (old.ticket_id is not null and not exists (
       select 1 from public.tickets where id = old.ticket_id and match_id = old.match_id)) then
    raise exception using errcode = '23503', message = 'implicit or triggered payment deletion is forbidden; delete payments explicitly while parents exist';
  end if;
  return old;
end;
$$;

drop trigger if exists payments_protect_parent_delete on public.payments;
create trigger payments_protect_parent_delete before delete on public.payments
for each row execute function public.protect_payment_parent_delete();

do $triggers$
declare
  v_table text;
  v_parent text;
begin
  foreach v_table in array array[
    'matches', 'watch_records', 'tickets', 'payments', 'watch_record_categories',
    'seats', 'payment_splits', 'match_inning_scores', 'match_team_totals',
    'match_pitchers', 'match_events', 'match_links'
  ] loop
    execute format('drop trigger if exists match_write_gate on public.%I', v_table);
    execute format('create trigger match_write_gate before insert or update or delete on public.%I for each statement execute function public.match_write_gate()', v_table);
    if v_table <> 'matches' then
      v_parent := case when v_table in ('watch_record_categories', 'seats', 'payment_splits')
        then 'watch_record_id' else 'match_id' end;
      execute format('drop trigger if exists propagate_match_revision on public.%I', v_table);
      execute format('create trigger propagate_match_revision after insert or update or delete on public.%I for each row execute function public.propagate_match_revision(%L)', v_table, v_parent);
    end if;
  end loop;
end;
$triggers$;

-- Strict v2 field validation. No identifiers/ownership/audit fields in values.
create or replace function public.validate_ticket_changes_values(p_values jsonb)
returns void language plpgsql security invoker
set search_path = public, pg_catalog as $$
declare
  v_key text;
  v_value jsonb;
  v_type text;
begin
  if jsonb_typeof(p_values) is distinct from 'object' then
    raise exception using errcode = '22023', message = 'ticket values must be an object';
  end if;
  for v_key, v_value in select * from jsonb_each(p_values) loop
    v_type := jsonb_typeof(v_value);
    if v_key not in ('status', 'release_date', 'purchase_date', 'issue_date', 'payment_deadline',
      'quantity', 'seat_type_name', 'seat_area', 'seat_row', 'seat_number', 'ticket_type',
      'vendor', 'notes', 'purchase_amount', 'my_expense', 'refund_amount', 'refund_status') then
      raise exception using errcode = '22023', message = 'unknown or immutable ticket field';
    end if;
    if v_type = 'null' then
      if v_key in ('status', 'refund_status') then
        raise exception using errcode = '23502', message = 'ticket status cannot be null';
      end if;
      continue;
    end if;
    if v_key = 'quantity' then
      if v_type <> 'number' or (v_value #>> '{}') !~ '^[1-9][0-9]*$' then
        raise exception using errcode = '22023', message = 'quantity must be a positive integer or null';
      end if;
      perform (v_value #>> '{}')::integer;
    elsif v_key in ('purchase_amount', 'my_expense', 'refund_amount') then
      if v_type <> 'number' or (v_value #>> '{}')::numeric < 0 then
        raise exception using errcode = '22023', message = 'ticket amount must be nonnegative numeric or null';
      end if;
    else
      if v_type <> 'string' then
        raise exception using errcode = '22023', message = 'ticket field must be a string or null';
      end if;
      if v_key in ('release_date', 'purchase_date', 'issue_date', 'payment_deadline') then
        if (v_value #>> '{}') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
          raise exception using errcode = '22023', message = 'ticket date must be YYYY-MM-DD or null';
        end if;
        perform (v_value #>> '{}')::date;
      elsif v_key = 'status' and (v_value #>> '{}') not in
        ('release_waiting', 'plan_to_buy', 'purchased', 'ticket_waiting', 'ticketed', 'cancelled_refund') then
        raise exception using errcode = '22023', message = 'invalid ticket status';
      elsif v_key = 'refund_status' and (v_value #>> '{}') not in ('none', 'pending', 'completed') then
        raise exception using errcode = '22023', message = 'invalid refund status';
      end if;
    end if;
  end loop;
end;
$$;

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
  v_contract_version integer := 1;
  v_existing_revision bigint;
  v_expected_revision bigint;
  v_ticket_changes jsonb := coalesce(p_payload -> 'ticket_changes', '{}'::jsonb);
  v_operation_ids uuid[] := array[]::uuid[];
  v_client_keys text[] := array[]::text[];
  v_created jsonb := '[]'::jsonb;
  v_fields jsonb;
  v_ticket public.tickets%rowtype;
  v_key text;
  v_ticket_operation text := p_payload ->> 'ticket_operation';
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception using errcode = '22023', message = 'payload must be a JSON object';
  end if;
  if p_payload ? 'contract_version' then
    if jsonb_typeof(p_payload -> 'contract_version') <> 'number'
       or p_payload ->> 'contract_version' not in ('1', '2') then
      raise exception using errcode = '22023', message = 'unsupported contract_version';
    end if;
    v_contract_version := (p_payload ->> 'contract_version')::integer;
  end if;
  if v_contract_version = 1 and p_payload ? 'ticket_changes' then
    raise exception using errcode = '22023', message = 'ticket_changes requires contract_version=2';
  end if;
  if v_contract_version = 2 then
    if p_payload ? 'ticket' or p_payload ? 'ticket_operation'
       or coalesce(v_replace ? 'ticket', false) then
      raise exception using errcode = '22023', message = 'v2 cannot mix legacy ticket fields';
    end if;
    if jsonb_typeof(v_ticket_changes) is distinct from 'object' then
      raise exception using errcode = '22023', message = 'ticket_changes must be an object';
    end if;
    if jsonb_typeof(v_match -> 'expected_revision') is distinct from 'string'
       or (v_match ->> 'expected_revision') !~ '^(0|[1-9][0-9]*)$' then
      raise exception using errcode = '22023', message = 'expected_revision must be a canonical nonnegative bigint string';
    end if;
    v_expected_revision := (v_match ->> 'expected_revision')::bigint;
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

  perform pg_catalog.pg_advisory_xact_lock(1936024935, 9);

  v_match_id := (v_match ->> 'id')::uuid;
  select owner_id, updated_at, revision into v_existing_owner, v_existing_updated_at, v_existing_revision
  from public.matches
  where id = v_match_id
  for update;
  if found and v_existing_owner <> v_owner_id then
    raise exception using errcode = '42501', message = 'match belongs to another owner';
  end if;
  if found and not (v_match ? 'expected_updated_at')
     then raise exception using errcode = 'PT409', message = 'expected_updated_at is required for updates';
  end if;
  if found and (v_match ->> 'expected_updated_at') is null
     then raise exception using errcode = 'PT409', message = 'expected_updated_at cannot be null for updates';
  end if;
  if found and v_match ? 'expected_updated_at'
     and v_existing_updated_at <> (v_match ->> 'expected_updated_at')::timestamptz then
    raise exception using errcode = 'PT409', message = 'match was modified by another session';
  end if;

  if v_contract_version = 2 and v_expected_revision <> coalesce(v_existing_revision, 0) then
    raise exception using errcode = 'PT409', message = 'match revision was modified by another session';
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

  if v_contract_version = 1 and coalesce((v_replace ->> 'ticket')::boolean, false) then
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

  if v_contract_version = 2 then
    -- Validate structure, duplicates and all UUIDs before changing ticket rows.
    for v_key in select jsonb_object_keys(v_ticket_changes) loop
      if v_key not in ('create', 'update', 'delete') then
        raise exception using errcode = '22023', message = 'unknown ticket operation';
      end if;
      if jsonb_typeof(v_ticket_changes -> v_key) is distinct from 'array' then
        raise exception using errcode = '22023', message = 'ticket operations must be arrays';
      end if;
    end loop;
    for v_value in select * from jsonb_array_elements(coalesce(v_ticket_changes -> 'create', '[]')) loop
      if jsonb_typeof(v_value) is distinct from 'object'
         or jsonb_typeof(v_value -> 'client_key') is distinct from 'string'
         or nullif(btrim(v_value ->> 'client_key'), '') is null
         or exists (select 1 from jsonb_object_keys(v_value) k where k not in ('client_key', 'values')) then
        raise exception using errcode = '22023', message = 'create requires client_key and values';
      end if;
      if (v_value ->> 'client_key') = any(v_client_keys) then
        raise exception using errcode = '22023', message = 'duplicate client_key';
      end if;
      v_client_keys := array_append(v_client_keys, v_value ->> 'client_key');
      perform public.validate_ticket_changes_values(v_value -> 'values');
    end loop;
    for v_value in select * from jsonb_array_elements(coalesce(v_ticket_changes -> 'update', '[]')) loop
      if jsonb_typeof(v_value) is distinct from 'object'
         or jsonb_typeof(v_value -> 'id') is distinct from 'string'
         or (v_value ->> 'id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
         or exists (select 1 from jsonb_object_keys(v_value) k where k not in ('id', 'changes')) then
        raise exception using errcode = '22023', message = 'update requires UUID and changes';
      end if;
      v_ticket_id := (v_value ->> 'id')::uuid;
      if v_ticket_id = any(v_operation_ids) then
        raise exception using errcode = '22023', message = 'duplicate ticket operation ID';
      end if;
      v_operation_ids := array_append(v_operation_ids, v_ticket_id);
      perform public.validate_ticket_changes_values(v_value -> 'changes');
    end loop;
    for v_value in select * from jsonb_array_elements(coalesce(v_ticket_changes -> 'delete', '[]')) loop
      if jsonb_typeof(v_value) is distinct from 'string'
         or (v_value #>> '{}') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        raise exception using errcode = '22023', message = 'delete requires UUID';
      end if;
      v_ticket_id := (v_value #>> '{}')::uuid;
      if v_ticket_id = any(v_operation_ids) then
        raise exception using errcode = '22023', message = 'duplicate ticket operation ID';
      end if;
      v_operation_ids := array_append(v_operation_ids, v_ticket_id);
    end loop;
    for v_ticket_id in select id from unnest(v_operation_ids) ids(id) order by id loop
      perform id from public.tickets
        where id = v_ticket_id and match_id = v_match_id and owner_id = v_owner_id for update;
      if not found then
        raise exception using errcode = '42501', message = 'ticket does not belong to this match';
      end if;
    end loop;

    for v_value in select * from jsonb_array_elements(coalesce(v_ticket_changes -> 'update', '[]')) loop
      v_ticket_id := (v_value ->> 'id')::uuid;
      v_fields := v_value -> 'changes';
      v_ticket := jsonb_populate_record(null::public.tickets, v_fields);
      update public.tickets set
        status = case when v_fields ? 'status' then v_ticket.status else status end,
        release_date = case when v_fields ? 'release_date' then v_ticket.release_date else release_date end,
        purchase_date = case when v_fields ? 'purchase_date' then v_ticket.purchase_date else purchase_date end,
        issue_date = case when v_fields ? 'issue_date' then v_ticket.issue_date else issue_date end,
        payment_deadline = case when v_fields ? 'payment_deadline' then v_ticket.payment_deadline else payment_deadline end,
        quantity = case when v_fields ? 'quantity' then v_ticket.quantity else quantity end,
        seat_type_name = case when v_fields ? 'seat_type_name' then v_ticket.seat_type_name else seat_type_name end,
        seat_area = case when v_fields ? 'seat_area' then v_ticket.seat_area else seat_area end,
        seat_row = case when v_fields ? 'seat_row' then v_ticket.seat_row else seat_row end,
        seat_number = case when v_fields ? 'seat_number' then v_ticket.seat_number else seat_number end,
        ticket_type = case when v_fields ? 'ticket_type' then v_ticket.ticket_type else ticket_type end,
        vendor = case when v_fields ? 'vendor' then v_ticket.vendor else vendor end,
        notes = case when v_fields ? 'notes' then v_ticket.notes else notes end,
        purchase_amount = case when v_fields ? 'purchase_amount' then v_ticket.purchase_amount else purchase_amount end,
        my_expense = case when v_fields ? 'my_expense' then v_ticket.my_expense else my_expense end,
        refund_amount = case when v_fields ? 'refund_amount' then v_ticket.refund_amount else refund_amount end,
        refund_status = case when v_fields ? 'refund_status' then v_ticket.refund_status else refund_status end
      where id = v_ticket_id and match_id = v_match_id and owner_id = v_owner_id;
    end loop;
    for v_value in select * from jsonb_array_elements(coalesce(v_ticket_changes -> 'delete', '[]')) loop
      delete from public.tickets
        where id = (v_value #>> '{}')::uuid and match_id = v_match_id and owner_id = v_owner_id;
    end loop;
    for v_value in select * from jsonb_array_elements(coalesce(v_ticket_changes -> 'create', '[]')) loop
      v_fields := v_value -> 'values';
      v_ticket := jsonb_populate_record(null::public.tickets, v_fields);
      insert into public.tickets (
        owner_id, match_id, status, release_date, purchase_date, issue_date, payment_deadline,
        quantity, seat_type_name, seat_area, seat_row, seat_number, ticket_type, vendor, notes,
        purchase_amount, my_expense, refund_amount, refund_status
      ) values (
        v_owner_id, v_match_id, coalesce(v_ticket.status, 'release_waiting'),
        v_ticket.release_date, v_ticket.purchase_date, v_ticket.issue_date, v_ticket.payment_deadline,
        v_ticket.quantity, v_ticket.seat_type_name, v_ticket.seat_area, v_ticket.seat_row,
        v_ticket.seat_number, v_ticket.ticket_type, v_ticket.vendor, v_ticket.notes,
        v_ticket.purchase_amount, v_ticket.my_expense, v_ticket.refund_amount, coalesce(v_ticket.refund_status, 'none')
      ) returning id into v_ticket_id;
      v_created := v_created || jsonb_build_array(jsonb_build_object('client_key', v_value ->> 'client_key', 'id', v_ticket_id));
    end loop;
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

  if v_contract_version = 2 then
    return (select jsonb_build_object(
      'ok', true, 'match_id', v_match_id, 'watch_record_id', v_watch_id,
      'updated_at', updated_at, 'revision', revision::text, 'created_tickets', v_created
    ) from public.matches where id = v_match_id and owner_id = v_owner_id);
  end if;
  return jsonb_build_object(
    'ok', true,
    'match_id', v_match_id,
    'watch_record_id', v_watch_id
  );
end;
$function$;

-- STABLE: every SELECT in this function uses the calling statement's MVCC
-- snapshot. The entire aggregate is built by ONE SELECT, without row locks or
-- writes; a READ ONLY transaction can call it. Subquery errors propagate.
create or replace function public.get_match_record_snapshot(p_match_id uuid)
returns jsonb language plpgsql stable security invoker
set search_path = public, pg_catalog as $$
declare
  v_snapshot jsonb;
begin
  if p_match_id is null then
    raise exception using errcode = '22023', message = 'match ID is required';
  end if;
  if auth.uid() is null or not public.current_user_is_authorized() then
    raise exception using errcode = '42501', message = 'authorized user is required';
  end if;
  select jsonb_build_object(
    'match', (to_jsonb(m) - 'revision') || jsonb_build_object('revision', m.revision::text),
    'watch_record', to_jsonb(w),
    'updated_at', m.updated_at,
    'revision', m.revision::text,
    'tickets', coalesce((select jsonb_agg(to_jsonb(t) order by t.id) from public.tickets t where t.match_id = m.id), '[]'::jsonb),
    'categories', coalesce((select jsonb_agg(to_jsonb(c) order by c.category_id) from public.watch_record_categories c where c.watch_record_id = w.id), '[]'::jsonb),
    'seats', coalesce((select jsonb_agg(to_jsonb(s)) from public.seats s where s.watch_record_id = w.id), '[]'::jsonb),
    'splits', coalesce((select jsonb_agg(to_jsonb(s) order by s.id) from public.payment_splits s where s.watch_record_id = w.id), '[]'::jsonb),
    'payments', coalesce((select jsonb_agg(to_jsonb(p) order by p.id) from public.payments p where p.match_id = m.id), '[]'::jsonb),
    'innings', coalesce((select jsonb_agg(to_jsonb(i) order by i.inning_number, i.side) from public.match_inning_scores i where i.match_id = m.id), '[]'::jsonb),
    'totals', coalesce((select jsonb_agg(to_jsonb(t) order by t.side) from public.match_team_totals t where t.match_id = m.id), '[]'::jsonb),
    'pitchers', coalesce((select jsonb_agg(to_jsonb(p) order by p.id) from public.match_pitchers p where p.match_id = m.id), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(to_jsonb(e) order by e.event_order, e.id) from public.match_events e where e.match_id = m.id), '[]'::jsonb),
    'links', coalesce((select jsonb_agg(to_jsonb(l) order by l.id) from public.match_links l where l.match_id = m.id), '[]'::jsonb)
  ) into v_snapshot
  from public.matches m left join public.watch_records w on w.match_id = m.id
  where m.id = p_match_id and m.owner_id = auth.uid();
  if v_snapshot is null then
    raise exception using errcode = '42501', message = 'match not found or not owned by caller';
  end if;
  return v_snapshot;
end;
$$;

revoke all on function public.match_write_gate(), public.advance_match_revision(),
  public.propagate_match_revision(), public.protect_ticket_payments(),
  public.protect_parent_payments(), public.protect_payment_parent_delete(),
  public.validate_ticket_changes_values(jsonb), public.save_match_record(jsonb),
  public.get_match_record_snapshot(uuid) from public, anon, authenticated;
grant execute on function public.validate_ticket_changes_values(jsonb), public.save_match_record(jsonb),
  public.get_match_record_snapshot(uuid) to authenticated;

commit;
