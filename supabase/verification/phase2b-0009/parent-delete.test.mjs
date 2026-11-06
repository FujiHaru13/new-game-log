import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyTarget, sql, session, transaction, prelude, rejects, literal, json, file,
  owner, other, match, watch, a, b, otherMatch, foreignTicket } from './harness.mjs';

console.log(JSON.stringify(verifyTarget()));
const check = expression => `select pg_temp.check(${expression});`;
const shapes = {
  watch_only: { watch_record_id: watch, ticket_id: null },
  ticket_only: { watch_record_id: null, ticket_id: a },
  both: { watch_record_id: watch, ticket_id: a },
};
const parent = { matches: match, watch_records: watch, tickets: a };
function payment(shape, { matchId = match, watchId = watch, ticketId = a, id } = {}) {
  const fields = shapes[shape];
  return `insert into public.payments(${id ? 'id,' : ''}owner_id,match_id,watch_record_id,ticket_id,title,amount)
    values(${id ? literal(id) + ',' : ''}'${owner}','${matchId}',${fields.watch_record_id ? literal(watchId) : 'null'},${fields.ticket_id ? literal(ticketId) : 'null'},'R1 synthetic payment',1234);`;
}
const children = `
  insert into public.seats(owner_id,watch_record_id,area) values('${owner}','${watch}','R1 area');
  insert into public.watch_record_categories(owner_id,watch_record_id,category_id) values('${owner}','${watch}','other');
  insert into public.payment_splits(owner_id,watch_record_id,title,amount) values('${owner}','${watch}','R1 split',100);
  insert into public.match_links(match_id,title,url) values('${match}','R1 link','https://example.test');`;

for (const table of Object.keys(parent)) test(`R1 unpaid ${table} DELETE succeeds and leaves no payment`, () => {
  transaction(`${children} delete from public.${table} where id='${parent[table]}';
    ${check(`not exists(select 1 from public.${table} where id='${parent[table]}')`)}
    ${check('not exists(select 1 from public.payments)')}`);
});

for (const [table, cases] of Object.entries({ matches: ['watch_only','ticket_only','both'], watch_records: ['watch_only','both'], tickets: ['ticket_only','both'] })) {
  for (const shape of cases) test(`R1 ${table} DELETE with ${shape} payment rejects and retains the entire aggregate`, () => {
    transaction(`${children} ${payment(shape)}
      select pg_temp.expect_error(${literal(`delete from public.${table} where id='${parent[table]}'`)},'23503');
      ${check("(select count(*)=1 and min(amount)=1234 from public.payments)")}`);
  });
}

test('R1 payment for a different owned match does not block an unrelated match DELETE', () => {
  const m = '10000000-0000-0000-0000-000000000099';
  const w = '20000000-0000-0000-0000-000000000099';
  transaction(`insert into public.matches(id,owner_id,match_date,home_team_id,away_team_id,match_type)
    values('${m}','${owner}','2026-11-06','dragons','giants','official');
    insert into public.watch_records(id,owner_id,match_id,watch_status,cheer_team_id) values('${w}','${owner}','${m}','scheduled','dragons');
    ${payment('watch_only', { matchId: m, watchId: w })}
    delete from public.matches where id='${match}';
    ${check(`exists(select 1 from public.matches where id='${m}') and (select count(*)=1 from public.payments where match_id='${m}')`)}`);
});

test('R1 unrelated watch-only payment permits deletion of an unlinked ticket', () => {
  transaction(`${payment('watch_only')} delete from public.tickets where id='${a}';
    ${check(`not exists(select 1 from public.tickets where id='${a}') and (select count(*)=1 from public.payments)`)}`);
});

test('R1 ticket-only payment survives unrelated watch deletion', () => {
  transaction(`${payment('ticket_only')} delete from public.watch_records where id='${watch}';
    ${check(`exists(select 1 from public.tickets where id='${a}') and (select count(*)=1 from public.payments)`)}`);
});

// Privileged fault injection ONLY inside a rolled-back isolated-DB transaction.
// Removing parent guards proves the payments-side defense against actual RI CASCADE.
for (const [table, shape] of [['matches','watch_only'], ['matches','both'], ['watch_records','both'], ['tickets','both']]) {
  test(`R1 payments defense rejects actual ${table} FK CASCADE (${shape}) even without parent guards`, () => {
    sql(`begin;
      alter table public.matches disable trigger matches_protect_payments;
      alter table public.watch_records disable trigger watch_records_protect_payments;
      alter table public.tickets disable trigger tickets_protect_payments;
      ${prelude} ${children} ${payment(shape)}
      select pg_temp.expect_error(${literal(`delete from public.${table} where id='${parent[table]}'`)},'23503');
      ${check("(select count(*)=1 and min(amount)=1234 from public.payments)")}
      rollback;`);
  });
}

test('R1 explicit top-level payments DELETE remains allowed, then parent deletion succeeds', () => {
  transaction(`${payment('both')}
    delete from public.payments where match_id='${match}';
    ${check(`exists(select 1 from public.matches where id='${match}') and exists(select 1 from public.watch_records where id='${watch}') and exists(select 1 from public.tickets where id='${a}')`)}
    delete from public.matches where id='${match}';
    ${check(`not exists(select 1 from public.matches where id='${match}') and not exists(select 1 from public.payments)`)}`);
});

test('R1 an earlier parent BEFORE trigger cannot remove payments before the parent guard', () => {
  sql(`begin;
    create function pg_temp.r1_early_payment_delete() returns trigger language plpgsql security invoker as $$
      begin delete from public.payments where match_id=old.id; return old; end; $$;
    create trigger a_r1_early_payment_delete before delete on public.matches
      for each row execute function pg_temp.r1_early_payment_delete();
    ${prelude} ${payment('both')}
    select pg_temp.expect_error(${literal(`delete from public.matches where id='${match}'`)},'23503');
    rollback;`);
});

test('R1 explicit payment deletion in an ordinary SECURITY INVOKER function remains allowed', () => {
  transaction(`${payment('both')}
    create function pg_temp.explicit_payment_delete(p_match_id uuid) returns void
      language plpgsql security invoker as $$ begin delete from public.payments where match_id=p_match_id; end; $$;
    select pg_temp.explicit_payment_delete('${match}');
    ${check(`not exists(select 1 from public.payments) and exists(select 1 from public.matches where id='${match}')`)}`);
});

test('R1 nested user-trigger payment deletion is conservatively refused with no client GUC bypass', () => {
  transaction(`${payment('both')}
    create temp table r1_delete_request(id integer);
    create function pg_temp.triggered_payment_delete() returns trigger language plpgsql as $$
      begin delete from public.payments; return new; end; $$;
    create trigger r1_delete_request after insert on r1_delete_request for each row execute function pg_temp.triggered_payment_delete();
    set local app.allow_payment_delete='true';
    set local app.allow_parent_delete='true';
    select pg_temp.expect_error('insert into r1_delete_request values(1)','23503');
    ${check('not exists(select 1 from r1_delete_request)')}`);
});

test('R1 v1/v2 ticket deletion and direct DELETE share the payment guard', () => {
  transaction(`${payment('both')}
    ${rejects(`public.save_match_record(pg_temp.payload('{}',1) || ${json({ replace: { ticket: true }, ticket_operation: 'delete', ticket: { id: a } })})`, '23503')}
    ${rejects(`public.save_match_record(pg_temp.payload(${json({ delete: [a] })}))`, '23503')}
    select pg_temp.expect_error(${literal(`delete from public.tickets where id='${a}'`)},'23503');`);
});

test('R1 guards remain enabled, invoker-only, non-public and non-bypassable by authenticated role', () => {
  transaction(`${payment('both')}
    ${check(`(select count(*)=4 from pg_trigger where tgname in ('matches_protect_payments','watch_records_protect_payments','tickets_protect_payments','payments_protect_parent_delete') and tgenabled='O')`)}
    ${check(`(select bool_and(not prosecdef) from pg_proc where oid in ('public.protect_parent_payments()'::regprocedure,'public.protect_payment_parent_delete()'::regprocedure))`)}
    ${check(`not has_function_privilege('authenticated','public.protect_parent_payments()','execute') and not has_function_privilege('anon','public.protect_payment_parent_delete()','execute')`)}
    select pg_temp.expect_error('alter table public.matches disable trigger matches_protect_payments','42501');
    select pg_temp.expect_error(${literal(`delete from public.matches where id='${match}'`)},'23503');`);
});

test('R1 RLS keeps other-owner parent/payment rows invisible and unmodifiable', () => {
  transaction(`set local request.jwt.claim.sub='${other}';
    insert into public.payments(owner_id,match_id,ticket_id,title,amount) values('${other}','${otherMatch}','${foreignTicket}','other owner',500);
    set local request.jwt.claim.sub='${owner}';
    ${check('not exists(select 1 from public.payments)')}
    delete from public.payments where match_id='${otherMatch}';
    delete from public.matches where id='${otherMatch}';
    set local request.jwt.claim.sub='${other}';
    ${check(`exists(select 1 from public.matches where id='${otherMatch}') and (select count(*)=1 from public.payments)`)}`);
});

test('R1 0009 reapplication preserves existing payments and all guards still refuse parent deletes', () => {
  // Strip only the migration's outer BEGIN/COMMIT so payment fixtures and DDL
  // share a test transaction; nothing is committed by this test.
  const migration = file('../../migrations/0009_phase2_multi_ticket_atomic.sql').replace(/^begin;$/m, '').replace(/commit;\s*$/, '');
  sql(`begin; ${prelude} ${payment('both')}
    create temp table before_reapply as select public.get_match_record_snapshot('${match}') value;
    reset role; ${migration}
    set local role authenticated;
    ${check(`(select value=public.get_match_record_snapshot('${match}') from before_reapply)`)}
    select pg_temp.expect_error(${literal(`delete from public.matches where id='${match}'`)},'23503');
    select pg_temp.expect_error(${literal(`delete from public.watch_records where id='${watch}'`)},'23503');
    select pg_temp.expect_error(${literal(`delete from public.tickets where id='${a}'`)},'23503');
    rollback;`);
});

const r = {
  m: '11000000-0000-0000-0000-000000000001',
  w: '21000000-0000-0000-0000-000000000001',
  t: '31000000-0000-0000-0000-000000000001',
  p: '41000000-0000-0000-0000-000000000001',
};
const roleSQL = `set local role authenticated; set local request.jwt.claim.sub='${owner}'; set local statement_timeout='6s';`;
function setupRace() {
  sql(`begin; ${roleSQL}
    insert into public.matches(id,owner_id,match_date,home_team_id,away_team_id,match_type) values('${r.m}','${owner}','2026-11-06','dragons','giants','official');
    insert into public.watch_records(id,owner_id,match_id,watch_status,cheer_team_id) values('${r.w}','${owner}','${r.m}','scheduled','dragons');
    insert into public.tickets(id,owner_id,match_id,status) values('${r.t}','${owner}','${r.m}','purchased'); commit;`);
}
function cleanupRace() {
  sql(`begin; ${roleSQL} delete from public.payments where id='${r.p}' and match_id='${r.m}'; delete from public.matches where id='${r.m}' and owner_id='${owner}'; commit;`);
}
async function waitFor(predicate, label) {
  const deadline = Date.now()+5000;
  while (Date.now()<deadline) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve,25));
  }
  throw new Error('Timed out waiting for '+label);
}
const observedWait = app => sql(`select count(*) from pg_stat_activity where datname=current_database() and application_name=${literal(app)} and wait_event='advisory';`) === '1';
async function finish(s) {
  if (!s) return;
  if (!s.child.stdin.destroyed && !s.child.stdin.writableEnded) s.child.stdin.end('rollback;');
  await Promise.allSettled([s.done]);
}
const raceParent = { matches: r.m, watch_records: r.w, tickets: r.t };
for (const table of Object.keys(raceParent)) {
  test(`R1 concurrent payment INSERT first, ${table} DELETE second: payment and parents retained`, async () => {
    setupRace();
    const first = session();
    const shape = table === 'tickets' ? 'ticket_only' : 'watch_only';
    const app = `r1-insert-first-${table}`;
    let second;
    try {
      first.child.stdin.write(`begin; ${roleSQL} ${payment(shape, { matchId: r.m, watchId: r.w, ticketId: r.t, id: r.p })} select 'READY';\n`);
      await waitFor(() => first.output().includes('READY'),'payment INSERT');
      second = session(`begin; ${roleSQL} set local application_name=${literal(app)};
        do $$ begin
          begin delete from public.${table} where id='${raceParent[table]}';
          exception when foreign_key_violation then raise notice 'R1_EXPECTED_23503'; return; end;
          raise exception 'parent DELETE unexpectedly succeeded';
        end; $$; rollback;`);
      await waitFor(() => observedWait(app),'parent advisory wait');
      first.child.stdin.end('commit;'); await first.done; await second.done;
      const value = JSON.parse(sql(`begin read only; ${roleSQL} select public.get_match_record_snapshot('${r.m}'); rollback;`));
      assert.equal(value.payments.length,1); assert.equal(value.payments[0].id,r.p);
      assert.equal(value.watch_record.id,r.w); assert.equal(value.tickets[0].id,r.t);
      assert.equal(Number(value.payments[0].amount),1234);
    } finally { await finish(first); await finish(second); }
    cleanupRace();
  });
  test(`R1 concurrent ${table} DELETE first, payment INSERT second: INSERT rejected by FK`, async () => {
    setupRace();
    const first = session();
    const shape = table === 'tickets' ? 'ticket_only' : 'watch_only';
    const app = `r1-delete-first-${table}`;
    let second;
    try {
      first.child.stdin.write(`begin; ${roleSQL} delete from public.${table} where id='${raceParent[table]}'; select 'READY';\n`);
      await waitFor(() => first.output().includes('READY'),'parent DELETE');
      second = session(`begin; ${roleSQL} set local application_name=${literal(app)};
        do $$ begin
          begin ${payment(shape, { matchId: r.m, watchId: r.w, ticketId: r.t, id: r.p })}
          exception when foreign_key_violation then raise notice 'R1_EXPECTED_23503'; return; end;
          raise exception 'payment INSERT unexpectedly succeeded';
        end; $$; rollback;`);
      await waitFor(() => observedWait(app),'INSERT advisory wait');
      first.child.stdin.end('commit;'); await first.done; await second.done;
      assert.equal(sql(`select count(*) from public.payments where id='${r.p}';`),'0');
      assert.equal(sql(`select count(*) from public.${table} where id='${raceParent[table]}';`),'0');
    } finally { await finish(first); await finish(second); }
    cleanupRace();
  });
}

test('R1 concurrent parent DELETE lock timeout is bounded and preserves all rows', async () => {
  const before = sql(`begin read only; ${roleSQL} select public.get_match_record_snapshot('${match}'); rollback;`);
  const first = session();
  try {
    first.child.stdin.write(`begin; ${roleSQL} ${payment('watch_only')} select 'READY';\n`);
    await waitFor(() => first.output().includes('READY'),'uncommitted payment');
    assert.throws(() => sql(`\\set VERBOSITY verbose
      begin; ${roleSQL} set local lock_timeout='150ms'; delete from public.matches where id='${match}'; commit;`), error => String(error.stderr).includes('55P03'));
    first.child.stdin.end('rollback;'); await first.done;
    assert.equal(sql(`begin read only; ${roleSQL} select public.get_match_record_snapshot('${match}'); rollback;`),before);
  } finally { await finish(first); }
});

test('R1 final residual and deadlock check', () => {
  assert.equal(sql(`select jsonb_build_array(
    (select count(*) from auth.users),(select count(*) from public.matches),
    (select count(*) from public.watch_records),(select count(*) from public.tickets),
    (select count(*) from public.payments),(select deadlocks from pg_stat_database where datname=current_database()),
    (select count(*) from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() and xact_start is not null));`), '[3, 2, 2, 3, 0, 0, 0]');
});
