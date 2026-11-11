-- R2-C2: ISOLATED DATABASE CANDIDATE ONLY. DO NOT APPLY TO CLOUD.
-- Prerequisite: 0009. v1/v2 RPC remains unchanged. v3 uses a separate RPC.
-- SECURITY REVIEW REQUIRED: the v3 SECURITY DEFINER wrapper invokes the
-- legacy SECURITY INVOKER core as the definer; isolated multi-owner tests are mandatory.
begin;

create table if not exists public.match_save_operations (
  owner_id uuid not null,
  match_id uuid not null,
  operation_id uuid not null,
  payload_digest text not null check (payload_digest ~ '^[0-9a-f]{64}$'),
  outcome text not null default 'committed' check (outcome = 'committed'),
  revision text not null check (revision ~ '^(0|[1-9][0-9]*)$'),
  updated_at timestamptz not null,
  created_tickets jsonb not null check (jsonb_typeof(created_tickets) = 'array'),
  watch_record_id uuid,
  committed_at timestamptz not null default clock_timestamp(),
  primary key (owner_id, operation_id)
);
-- Intentionally no FK to matches: historical evidence must survive deletions.
create index if not exists match_save_operations_match_idx
  on public.match_save_operations (owner_id, match_id, committed_at desc);
alter table public.match_save_operations enable row level security;
alter table public.match_save_operations force row level security;
revoke all on table public.match_save_operations from public, anon, authenticated;

-- The digest is PostgreSQL jsonb's textual representation, NOT JS JSON.stringify.
-- Clients must obtain the digest using the read-only helper on the exact v3
-- payload, preserving its contents between preflight and submission.
create or replace function public.get_match_save_payload_digest(p_payload jsonb)
returns text language plpgsql stable security invoker
set search_path = pg_catalog, public as $$
begin
  if auth.uid() is null or not public.current_user_is_authorized() then
    raise exception using errcode = '42501', message = 'authorized user is required';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object'
     or p_payload ->> 'contract_version' <> '3'
     or jsonb_typeof(p_payload -> 'match') <> 'object'
     or nullif(p_payload #>> '{match,id}', '') is null then
    raise exception using errcode = '22023', message = 'v3 payload required';
  end if;
  return encode(pg_catalog.sha256(pg_catalog.convert_to(
    (p_payload - 'payload_digest' - 'operation_id')::text, 'UTF8'
  )), 'hex');
end;
$$;

-- SECURITY DEFINER is needed because authenticated callers cannot INSERT
-- fabricated committed receipts. Manual security review is a release blocker.
create or replace function public.save_match_record_v3(p_payload jsonb)
returns jsonb language plpgsql volatile security definer
set search_path = pg_catalog, public as $function$
declare
  v_owner uuid := auth.uid();
  v_match uuid;
  v_op uuid;
  v_digest text;
  v_expected_digest text;
  v_prior public.match_save_operations%rowtype;
  v_existing_owner uuid;
  v_core jsonb;
  v_receipt jsonb;
begin
  if v_owner is null or not public.current_user_is_authorized() then
    raise exception using errcode = '42501', message = 'authorized user is required';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object'
     or jsonb_typeof(p_payload -> 'contract_version') <> 'number'
     or p_payload ->> 'contract_version' <> '3'
     or jsonb_typeof(p_payload -> 'match') <> 'object'
     or jsonb_typeof(p_payload #> '{match,id}') <> 'string'
     or jsonb_typeof(p_payload -> 'operation_id') <> 'string'
     or jsonb_typeof(p_payload -> 'payload_digest') <> 'string'
     or (p_payload ->> 'operation_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
     or (p_payload ->> 'payload_digest') !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'invalid v3 envelope';
  end if;
  v_match := (p_payload #>> '{match,id}')::uuid;
  v_op := (p_payload ->> 'operation_id')::uuid;
  v_digest := p_payload ->> 'payload_digest';
  v_expected_digest := encode(pg_catalog.sha256(pg_catalog.convert_to(
    (p_payload - 'payload_digest' - 'operation_id')::text, 'UTF8'
  )), 'hex');
  if v_digest <> v_expected_digest then
    raise exception using errcode = '22023', message = 'payload_digest does not match v3 payload';
  end if;

  -- Exactly the same gate as 0009. Receipt lookup MUST precede revision CAS.
  perform pg_catalog.pg_advisory_xact_lock(1936024935, 9);
  select * into v_prior from public.match_save_operations
    where owner_id = v_owner and operation_id = v_op;
  if found then
    if v_prior.match_id <> v_match or v_prior.payload_digest <> v_digest then
      raise exception using errcode = 'PT409', message = 'operation_id was reused with another payload';
    end if;
    return jsonb_build_object(
      'ok', true, 'contract_version', 3, 'replayed', true,
      'match_id', v_prior.match_id, 'watch_record_id', v_prior.watch_record_id,
      'operation_id', v_op, 'payload_digest', v_digest,
      'revision', v_prior.revision, 'updated_at', v_prior.updated_at,
      'created_tickets', v_prior.created_tickets
    );
  end if;

  -- This explicit owner check is essential because this is a DEFINER function.
  select owner_id into v_existing_owner from public.matches where id = v_match;
  if found and v_existing_owner <> v_owner then
    raise exception using errcode = '42501', message = 'match belongs to another owner';
  end if;

  -- Existing 0009 code is unchanged and still validates expected_revision,
  -- parent ownership, field contracts and payments. One transaction only.
  v_core := public.save_match_record(
    (p_payload - 'operation_id' - 'payload_digest') || jsonb_build_object('contract_version', 2)
  );
  if jsonb_typeof(v_core) <> 'object' or v_core -> 'ok' <> 'true'::jsonb
     or v_core ->> 'match_id' <> v_match::text
     or (v_core ->> 'revision') !~ '^(0|[1-9][0-9]*)$'
     or jsonb_typeof(v_core -> 'created_tickets') <> 'array'
     or nullif(v_core ->> 'updated_at', '') is null then
    raise exception using errcode = '22023', message = 'invalid internal v2 success result';
  end if;
  insert into public.match_save_operations (
    owner_id, match_id, operation_id, payload_digest, revision,
    updated_at, created_tickets, watch_record_id
  ) values (
    v_owner, v_match, v_op, v_digest, v_core ->> 'revision',
    (v_core ->> 'updated_at')::timestamptz, v_core -> 'created_tickets',
    (v_core ->> 'watch_record_id')::uuid
  );
  return v_core || jsonb_build_object(
    'contract_version', 3, 'operation_id', v_op,
    'payload_digest', v_digest, 'replayed', false
  );
end;
$function$;

create or replace function public.get_match_save_operation_receipt(p_operation_id uuid)
returns jsonb language plpgsql stable security definer
set search_path = pg_catalog, public as $$
declare
  v_owner uuid := auth.uid();
  v_result jsonb;
begin
  if v_owner is null or not public.current_user_is_authorized() then
    raise exception using errcode = '42501', message = 'authorized user is required';
  end if;
  if p_operation_id is null then
    raise exception using errcode = '22023', message = 'operation_id required';
  end if;
  select jsonb_build_object(
    'ownerId', owner_id, 'matchId', match_id, 'attemptId', operation_id,
    'payloadDigest', payload_digest, 'outcome', outcome,
    'revision', revision, 'updatedAt', updated_at, 'committedAt', committed_at,
    'createdTickets', created_tickets
  ) into v_result
  from public.match_save_operations
  where owner_id = v_owner and operation_id = p_operation_id;
  return v_result;
end;
$$;

revoke all on function public.get_match_save_payload_digest(jsonb),
  public.save_match_record_v3(jsonb), public.get_match_save_operation_receipt(uuid)
  from public, anon, authenticated;
grant execute on function public.get_match_save_payload_digest(jsonb),
  public.save_match_record_v3(jsonb), public.get_match_save_operation_receipt(uuid)
  to authenticated;

commit;
