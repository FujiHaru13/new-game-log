\set ON_ERROR_STOP on
INSERT INTO public.authorized_users(user_id) VALUES
('11111111-1111-4111-8111-111111111111'),
('22222222-2222-4222-8222-222222222222');

SET ROLE authenticated;
SET request.jwt.claim.sub TO '11111111-1111-4111-8111-111111111111';
DO $test$
DECLARE
  base jsonb := jsonb_build_object(
    'contract_version', 3,
    'operation_id', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'match', jsonb_build_object('id','aaaaaaaa-1111-4111-8111-111111111111',
      'expected_revision','0','match_date','2026-11-11',
      'home_team_id','dragons','away_team_id','giants',
      'match_type','official','match_status','scheduled'),
    'ticket_changes', jsonb_build_object('create','[]'::jsonb,'update','[]'::jsonb,'delete','[]'::jsonb)
  );
  payload jsonb;
  first_receipt jsonb;
  replay_receipt jsonb;
  count_receipt integer;
  count_matches integer;
  got_error boolean;
BEGIN
  payload := base || jsonb_build_object('payload_digest',public.get_match_save_payload_digest(base));
  first_receipt := public.save_match_record_v3(payload);
  IF first_receipt ->> 'replayed' <> 'false' THEN RAISE EXCEPTION 'first commit must not be replayed'; END IF;
  replay_receipt := public.save_match_record_v3(payload);
  IF replay_receipt ->> 'replayed' <> 'true' THEN RAISE EXCEPTION 'replay did not return stored receipt'; END IF;
  IF first_receipt ->> 'revision' IS DISTINCT FROM replay_receipt ->> 'revision' THEN
    RAISE EXCEPTION 'replay changed revision';
  END IF;
  IF (public.get_match_save_operation_receipt('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') ->> 'outcome') IS DISTINCT FROM 'committed' THEN
    RAISE EXCEPTION 'committed receipt missing';
  END IF;
  got_error := false;
  BEGIN
    PERFORM public.save_match_record_v3(payload || jsonb_build_object('payload_digest',repeat('0',64)));
  EXCEPTION WHEN SQLSTATE '22023' THEN got_error := true;
  END;
  IF NOT got_error THEN RAISE EXCEPTION 'invalid digest was accepted'; END IF;
  got_error := false;
  BEGIN
    PERFORM public.save_match_record_v3(
      (payload || jsonb_build_object('match',
        (payload -> 'match') || jsonb_build_object('notes','different')))
      || jsonb_build_object('payload_digest', public.get_match_save_payload_digest(
        (payload || jsonb_build_object('match',
          (payload -> 'match') || jsonb_build_object('notes','different')))
      ))
    );
  EXCEPTION WHEN SQLSTATE 'PT409' THEN got_error := true;
  END;
  IF NOT got_error THEN RAISE EXCEPTION 'operation ID accepted different payload'; END IF;
  BEGIN
    SELECT count(*) INTO count_receipt FROM public.match_save_operations;
    RAISE EXCEPTION 'authenticated could directly SELECT receipt table';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO public.match_save_operations(owner_id,match_id,operation_id,payload_digest,revision,updated_at,created_tickets)
    VALUES ('11111111-1111-4111-8111-111111111111','aaaaaaaa-1111-4111-8111-111111111111',
      'ffffffff-ffff-4fff-8fff-ffffffffffff',repeat('0',64),'1',now(),'[]'::jsonb);
    RAISE EXCEPTION 'authenticated could forge receipt';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END
$test$;

SET request.jwt.claim.sub TO '22222222-2222-4222-8222-222222222222';
DO $test$
DECLARE
  stolen jsonb;
  other_payload jsonb;
  got_error boolean := false;
BEGIN
  stolen := public.get_match_save_operation_receipt('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
  IF stolen IS NOT NULL THEN RAISE EXCEPTION 'cross-owner receipt disclosed'; END IF;
  other_payload := jsonb_build_object('contract_version',3,
      'operation_id','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      'match',jsonb_build_object('id','aaaaaaaa-1111-4111-8111-111111111111',
        'expected_revision','0','notes','foreign update'));
  BEGIN
    PERFORM public.save_match_record_v3(other_payload || jsonb_build_object('payload_digest',public.get_match_save_payload_digest(other_payload)));
  EXCEPTION WHEN insufficient_privilege THEN got_error := true;
  END;
  IF NOT got_error THEN RAISE EXCEPTION 'cross-owner write not refused with insufficient_privilege'; END IF;
END
$test$;
RESET ROLE;

SET ROLE authenticated;
SET request.jwt.claim.sub TO '11111111-1111-4111-8111-111111111111';
BEGIN;
DO $test$
DECLARE
  p jsonb := jsonb_build_object('contract_version',3,
    'operation_id','cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'match',jsonb_build_object('id','cccccccc-1111-4111-8111-111111111111',
      'expected_revision','0','match_date','2026-11-11',
      'home_team_id','dragons','away_team_id','giants',
      'match_type','official','match_status','scheduled'));
BEGIN
  PERFORM public.save_match_record_v3(p || jsonb_build_object('payload_digest',public.get_match_save_payload_digest(p)));
END $test$;
ROLLBACK;
DO $test$
BEGIN
  IF public.get_match_save_operation_receipt('cccccccc-cccc-4ccc-8ccc-cccccccccccc') IS NOT NULL THEN
    RAISE EXCEPTION 'rolled-back transaction left receipt';
  END IF;
END $test$;
RESET ROLE;
DO $test$
DECLARE n int;
BEGIN
 SELECT count(*) INTO n FROM public.matches WHERE id = 'cccccccc-1111-4111-8111-111111111111';
 IF n <> 0 THEN RAISE EXCEPTION 'rolled-back transaction left match'; END IF;
 SELECT count(*) INTO n FROM public.match_save_operations WHERE operation_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 IF n <> 1 THEN RAISE EXCEPTION 'expected one durable receipt, got %', n; END IF;
END $test$;
\echo ISOLATED SQL BASIC SECURITY/REPLAY/ROLLBACK PASS (not complete acceptance)
