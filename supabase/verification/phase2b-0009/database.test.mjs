import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyTarget, sql, session, transaction, prelude, rpc, rejects, literal, json,
  owner, other, unapproved, match, otherMatch, watch, a, b, foreignTicket, missing, file } from './harness.mjs';

console.log(JSON.stringify(verifyTarget()));
const check = expression => `select pg_temp.check(${expression});`;
const call = changes => rpc(changes);
const expect = (changes, code = '22023') => rejects(call(changes), code);
const snapshot = `public.get_match_record_snapshot('${match}')`;
const countTickets = `(select count(*) from public.tickets where match_id='${match}')`;

// Every ordinary case runs in a transaction and rolls back its own fixtures.
test('0009 reapplication preserves every row, revision, timestamp and RLS policy', () => {
  const before = sql(`select jsonb_agg(to_jsonb(m) order by id) from public.matches m;`);
  const policies = sql('select jsonb_agg(to_jsonb(p) order by tablename,policyname) from pg_policies p;');
  sql(file('../../migrations/0009_phase2_multi_ticket_atomic.sql'));
  assert.equal(sql('select jsonb_agg(to_jsonb(m) order by id) from public.matches m;'), before);
  assert.equal(sql('select jsonb_agg(to_jsonb(p) order by tablename,policyname) from pg_policies p;'), policies);
});

test('v1 omitted version keeps exact response shape and ID-less single ticket update', () => {
  transaction(`delete from public.tickets where id='${b}';
    create temp table result as select public.save_match_record(pg_temp.payload('{}',1) ||
      ${json({ replace: { ticket: true }, ticket: { status: 'ticketed', notes: 'v1 update' } })}) value;
    ${check("(select array_agg(k order by k) from result, jsonb_object_keys(value) k) = array['match_id','ok','watch_record_id']")}
    ${check(`${countTickets}=1 and (select notes='v1 update' from public.tickets where id='${a}')`)}`);
});

test('v1 explicit version 1 and explicit single ticket deletion remain supported', () => {
  transaction(`select public.save_match_record(pg_temp.payload('{}',1) || ${json({ contract_version: 1, replace: { ticket: true }, ticket_operation: 'delete', ticket: { id: a } })});
    ${check(`not exists(select 1 from public.tickets where id='${a}') and ${countTickets}=1`)}`);
});

const newPayload = version => ({
  ...(version === 2 ? { contract_version: 2, ticket_changes: { create: [{ client_key: 'new', values: { status: 'purchased' } }] } } : { replace: { ticket: true }, ticket: { status: 'purchased' } }),
  match: { id: missing, match_date: '2026-11-07', home_team_id: 'dragons', away_team_id: 'giants', match_type: 'official', match_status: 'scheduled', ...(version === 2 ? { expected_revision: '0' } : {}) },
  watch: { watch_status: 'scheduled', cheer_team_id: 'dragons' },
});
for (const version of [1, 2]) test(`v${version} creates a new match, watch and DB-generated ticket UUID atomically`, () => {
  transaction(`create temp table result as select public.save_match_record(${json(newPayload(version))}) value;
    ${check(`(select count(*)=1 from public.tickets where match_id='${missing}')`)}
    ${check(`(select owner_id='${owner}' from public.matches where id='${missing}')`)}
    ${version === 2 ? check(`(select (value->'created_tickets'->0->>'id')::uuid=t.id from result join public.tickets t on t.match_id='${missing}')`) : ''}`);
});

test('v2 create always adds when exactly one existing ticket is present', () => {
  transaction(`delete from public.tickets where id='${b}'; select ${call({ create: [{ client_key: 'new', values: { status: 'purchased' } }] })};
    ${check(`${countTickets}=2 and (select vendor='original' from public.tickets where id='${a}')`)}`);
});

test('v2 omitted and empty operations preserve zero, one and multiple tickets', () => {
  transaction(`select public.save_match_record(pg_temp.payload() - 'ticket_changes');
    select ${call({ create: [], update: [], delete: [] })}; ${check(`${countTickets}=2`)}
    delete from public.tickets where id='${b}'; select ${call()}; ${check(`${countTickets}=1`)}
    delete from public.tickets where id='${a}'; select ${call()}; ${check(`${countTickets}=0`)}`);
});

test('v2 mixed update-delete-create preserves untouched fields, IDs and returns clocks/mapping', () => {
  transaction(`create temp table before_save as select * from public.matches where id='${match}';
    create temp table result as select ${call({ update: [{ id: a, changes: { status: 'ticketed', vendor: null } }], delete: [b], create: [{ client_key: 'c', values: { status: 'purchased', quantity: 3, notes: 'new' } }] })} value;
    ${check(`${countTickets}=2`)}
    ${check(`(select status='ticketed' and quantity=1 and vendor is null from public.tickets where id='${a}')`)}
    ${check(`not exists(select 1 from public.tickets where id='${b}')`)}
    ${check(`(select (value->>'revision')=m.revision::text and (value->>'updated_at')::timestamptz=m.updated_at and m.revision>old.revision and m.updated_at>old.updated_at from result, public.matches m, before_save old where m.id='${match}')`)}
    ${check("(select value->'created_tickets'->0->>'client_key'='c' from result)")}
    ${check(`(select exists(select 1 from public.tickets t where t.id=(value->'created_tickets'->0->>'id')::uuid and t.notes='new') from result)`)}
  `);
});

test('v2 unspecified tickets and hidden ticket amounts remain unchanged', () => {
  transaction(`update public.tickets set purchase_amount=1200, refund_status='pending' where id='${b}';
    create temp table untouched as select to_jsonb(t) value from public.tickets t where id='${b}';
    select ${call({ update: [{ id: a, changes: { notes: 'only A' } }] })};
    ${check(`(select value=to_jsonb(t) from untouched, public.tickets t where t.id='${b}')`)}`);
});

test('v2 explicit null clears nullable fields; omitted fields remain', () => {
  transaction(`select ${call({ update: [{ id: a, changes: { quantity: null, vendor: null, notes: null } }] })};
    ${check(`(select quantity is null and vendor is null and notes is null and status='purchased' from public.tickets where id='${a}')`)}
    ${expect({ update: [{ id: a, changes: { status: null } }] }, '23502')}`);
});

test('late create constraint failure rolls back match, watch, ticket updates and deletion', () => {
  transaction(expect({ update: [{ id: a, changes: { notes: 'must rollback' } }], delete: [b], create: [{ client_key: 'bad', values: { purchase_amount: 1000000000000 } }] }, '22003'));
});

test('failure in detail save after ticket operations rolls back the whole aggregate', () => {
  transaction(rejects(`${call({ update: [{ id: a, changes: { notes: 'rollback' } }], delete: [b], create: [{ client_key: 'c', values: {} }] }).replace(/\)$/, ` || ${json({ replace: { links: true }, links: [{ title: 'bad', url: 'not-http' }] })})`)}`, '23514'));
});

for (const id of [missing, foreignTicket]) test(`v2 rejects nonexistent or foreign UUID ${id}`, () => {
  transaction(`${expect({ update: [{ id, changes: { notes: 'bad' } }] }, '42501')}${expect({ delete: [id] }, '42501')}`);
});

test('v2 rejects same-owner ticket UUID belonging to another match', () => {
  transaction(`insert into public.matches(id,owner_id,match_date,home_team_id,away_team_id,match_type) values('${missing}','${owner}','2026-11-07','dragons','giants','official');
    insert into public.tickets(id,owner_id,match_id) values('30000000-0000-0000-0000-000000000099','${owner}','${missing}');
    ${expect({ delete: ['30000000-0000-0000-0000-000000000099'] }, '42501')}`);
});

const badOperations = [
  { update: [{ id: a, changes: {} }, { id: a, changes: {} }] },
  { delete: [a, a] },
  { update: [{ id: a, changes: {} }], delete: [a] },
  { create: [{ client_key: 'same', values: {} }, { client_key: 'same', values: {} }] },
  { create: [{ values: {} }] }, { create: [{ client_key: '', values: {} }] },
  { create: [{ client_key: 'x', values: {}, id: a }] },
  { update: [{ id: a, changes: {}, unexpected: true }] },
  { update: [{ id: 'bad', changes: {} }] }, { delete: [null] },
  { create: null }, { update: {} }, { delete: 'bad' }, { unknown: [] },
  { create: [{ client_key: 'x', values: { id: a } }] },
  { update: [{ id: a, changes: { owner_id: other } }] },
];
test('v2 rejects duplicates, missing keys, malformed operation arrays and immutable fields', () => {
  transaction(badOperations.map(changes => expect(changes)).join('\n'));
});

test('v2 rejects wrong field types, statuses, quantities and dates', () => {
  const invalid = [
    [{ status: 'wrong' }, '22023'], [{ status: 1 }, '22023'], [{ quantity: 0 }, '22023'],
    [{ quantity: -1 }, '22023'], [{ quantity: 1.5 }, '22023'], [{ quantity: '1' }, '22023'],
    [{ quantity: 2147483648 }, '22003'], [{ vendor: {} }, '22023'], [{ notes: true }, '22023'],
    [{ purchase_date: '2026-02-30' }, '22008'], [{ release_date: '2026/11/06' }, '22023'],
    [{ issue_date: 'infinity' }, '22023'], [{ payment_deadline: 20261106 }, '22023'],
    [{ purchase_amount: '100' }, '22023'], [{ refund_amount: -1 }, '22023'], [{ refund_status: 'bad' }, '22023'],
  ];
  transaction(invalid.map(([values, code]) => expect({ create: [{ client_key: 'invalid', values }] }, code)).join('\n'));
});

test('unknown, null, string and fractional contract versions are explicitly rejected', () => {
  transaction([0, 3, null, '2', 2.5].map(version => rejects(`public.save_match_record(pg_temp.payload() || ${json({ contract_version: version })})`)).join('\n'));
});

test('v2 legacy ticket mixing and v1 ticket_changes are rejected', () => {
  transaction([
    { ticket: {} }, { ticket: null }, { ticket_operation: 'delete' }, { replace: { ticket: false } },
  ].map(fields => rejects(`public.save_match_record(pg_temp.payload() || ${json(fields)})`)).join('\n') +
    rejects(`public.save_match_record(pg_temp.payload('{}',1) || '{"ticket_changes":{}}')`) +
    rejects(`public.save_match_record(pg_temp.payload() || '{"ticket_changes":null}')`));
});

test('expected_revision must be a canonical bigint STRING and is mandatory', () => {
  transaction([null, 0, -1, '01', '-1', '+1', '1.0', '1e1', ' ', {}, []].map(value =>
    rejects(`public.save_match_record(jsonb_set(pg_temp.payload(),'{match,expected_revision}',${json(value)}))`)).join('\n') +
    rejects(`public.save_match_record(pg_temp.payload() #- '{match,expected_revision}')`) +
    rejects(`public.save_match_record(jsonb_set(pg_temp.payload(),'{match,expected_revision}','"9223372036854775808"'))`, '22003'));
});

test('stale revision returns PT409 without changing any state', () => {
  transaction(rejects(`public.save_match_record(jsonb_set(pg_temp.payload(),'{match,expected_revision}','"99999"'))`, 'PT409'));
});

test('v2 new match also requires the initial expected_revision of zero', () => {
  const value = newPayload(2); value.match.expected_revision = '1';
  transaction(rejects(`public.save_match_record(${json(value)})`, 'PT409'));
});

test('v1 updated_at detects direct ticket INSERT, UPDATE and DELETE', () => {
  transaction(`
    create temp table stale as select pg_temp.payload('{}',1) value;
    update public.tickets set notes='direct' where id='${a}';
    ${rejects('public.save_match_record((select value from stale))', 'PT409')}
    update stale set value=pg_temp.payload('{}',1);
    insert into public.tickets(owner_id,match_id) values('${owner}','${match}');
    ${rejects('public.save_match_record((select value from stale))', 'PT409')}
    update stale set value=pg_temp.payload('{}',1);
    delete from public.tickets where id='${b}';
    ${rejects('public.save_match_record((select value from stale))', 'PT409')}
  `);
});

test('v2 stale revision alone detects direct DML even with a refreshed timestamp', () => {
  transaction(`create temp table stale as select pg_temp.payload() value;
    update public.tickets set notes='direct' where id='${a}';
    ${rejects(`public.save_match_record(jsonb_set((select value from stale),'{match,expected_updated_at}',(pg_temp.payload()#>'{match,expected_updated_at}')))`, 'PT409')}`);
});

test('monotonic DB time and revision cannot be overwritten by client values', () => {
  transaction(`create temp table old as select revision,updated_at from public.matches where id='${match}';
    update public.matches set revision=0,updated_at='2000-01-01' where id='${match}';
    ${check(`(select m.revision>old.revision and m.updated_at>old.updated_at from old,public.matches m where m.id='${match}')`)}`);
});

test('revision larger than JS safe integer is returned as an exact string', () => {
  sql(`begin;
    alter table public.matches disable trigger matches_set_updated_at;
    update public.matches set revision=9007199254740993 where id='${match}';
    alter table public.matches enable trigger matches_set_updated_at;
    ${prelude}
    ${check(`(${snapshot}->>'revision')='9007199254740993' and jsonb_typeof(${snapshot}->'match'->'revision')='string'`)}
    create temp table result as select ${call()} value;
    ${check("(select value->>'revision'='9007199254740994' and jsonb_typeof(value->'revision')='string' from result)")}
    rollback;`);
});

test('payments protect v1 deletion, v2 mixed deletion and direct ticket deletion', () => {
  transaction(`insert into public.payments(owner_id,match_id,ticket_id,title,amount) values('${owner}','${match}','${a}','protected',1000);
    ${expect({ update: [{ id: b, changes: { notes: 'rollback' } }], delete: [a], create: [{ client_key: 'c', values: {} }] }, '23503')}
    ${rejects(`public.save_match_record(pg_temp.payload('{}',1) || ${json({ replace: { ticket: true }, ticket_operation: 'delete', ticket: { id: a } })})`, '23503')}
    select pg_temp.expect_error(${literal(`delete from public.tickets where id='${a}'`)},'23503');
    ${check("(select count(*)=1 and min(amount)=1000 from public.payments)")}`);
});

test('v1 replace omitted, false, null and explicit JSON null preserve existing behavior', () => {
  transaction(`select public.save_match_record(pg_temp.payload('{}',1));
    ${rejects(`public.save_match_record(pg_temp.payload('{}',1) || '{"replace":null}')`)}
    select public.save_match_record(pg_temp.payload('{}',1) || '{"replace":{"ticket":false},"ticket":null}');
    ${check(`${countTickets}=2`)}
    select public.save_match_record(pg_temp.payload('{}',1) || '{"replace":{"ticket":true}}');
    select public.save_match_record(pg_temp.payload('{}',1) || '{"replace":{"ticket":null,"innings":false,"pitchers":false}}');
    ${check(`${countTickets}=2`)}
    ${rejects(`public.save_match_record(pg_temp.payload('{}',1) || '{"replace":{"ticket":true},"ticket":null}')`)}
    ${rejects(`public.save_match_record(pg_temp.payload('{}',1) || '{"replace":{"innings":false},"innings":null}')`)}
    ${rejects(`public.save_match_record(pg_temp.payload('{}',1) || '{"replace":{"pitchers":false},"pitchers":null}')`)}
  `);
});

test('v1 detailed match/watch/category/seat/split/inning/pitcher/event/link saves remain atomic', () => {
  const details = {
    watch: { watch_status: 'watched', cheer_team_id: 'dragons', total_price: 2000 },
    replace: { categories: true, seat: true, splits: true, innings: true, pitchers: true, events: true, links: true },
    categories: [{ id: 'dragons_1st', is_primary: true }], seat: { custom_seat_type_name: 'infield', area: 'A' },
    splits: [{ title: 'split', amount: 500 }], innings: { home: [0, 'X'], away: [1, null], homeHits: 3 },
    pitchers: { homeStarter: 'starter' }, home_runs: ['batter'], events: 'event', links: [{ title: 'box', url: 'https://example.test' }],
  };
  transaction(`select public.save_match_record(pg_temp.payload('{}',1) || ${json(details)});
    ${check(`(${snapshot}->'watch_record'->>'total_price')::numeric=2000`)}
    ${check(`jsonb_array_length(${snapshot}->'categories')=1 and jsonb_array_length(${snapshot}->'seats')=1 and jsonb_array_length(${snapshot}->'splits')=1`)}
    ${check(`jsonb_array_length(${snapshot}->'innings')=3 and jsonb_array_length(${snapshot}->'totals')=2 and jsonb_array_length(${snapshot}->'pitchers')=1`)}
    ${check(`jsonb_array_length(${snapshot}->'events')=2 and jsonb_array_length(${snapshot}->'links')=1 and ${countTickets}=2`)}
  `);
});

const childCases = [
  ['watch_records', `update public.watch_records set watch_memo='changed' where id='${watch}'`],
  ['tickets', `update public.tickets set notes='changed' where id='${a}'`],
  ['payments', `insert into public.payments(owner_id,match_id,watch_record_id,title,amount) values('${owner}','${match}','${watch}','direct',10)`],
  ['watch_record_categories', `insert into public.watch_record_categories(owner_id,watch_record_id,category_id) values('${owner}','${watch}','other')`],
  ['seats', `insert into public.seats(owner_id,watch_record_id,area) values('${owner}','${watch}','A')`],
  ['payment_splits', `insert into public.payment_splits(owner_id,watch_record_id,title,amount) values('${owner}','${watch}','direct',10)`],
  ['match_inning_scores', `insert into public.match_inning_scores(match_id,inning_number,side,runs) values('${match}',1,'home',0)`],
  ['match_team_totals', `insert into public.match_team_totals(match_id,side,hits) values('${match}','home',0)`],
  ['match_pitchers', `insert into public.match_pitchers(match_id,side,role,player_name) values('${match}','home','starter','name')`],
  ['match_events', `insert into public.match_events(match_id,event_type,description) values('${match}','other','event')`],
  ['match_links', `insert into public.match_links(match_id,title,url) values('${match}','link','https://example.test')`],
];
for (const [table, statement] of childCases) test(`${table} direct DML propagates revision and DB time`, () => {
  transaction(`create temp table old as select revision,updated_at from public.matches where id='${match}';
    ${statement};
    ${check(`(select m.revision>old.revision and m.updated_at>old.updated_at from public.matches m, old where m.id='${match}')`)}
    update old set revision=m.revision,updated_at=m.updated_at from public.matches m where m.id='${match}';
    update public.${table} set ${({watch_records: "watch_memo='second change'", tickets: "notes='second change'", payments: "title='second change'", watch_record_categories: 'is_primary=true', seats: "area='B'", payment_splits: "title='second change'", match_inning_scores: 'runs=2', match_team_totals: 'hits=2', match_pitchers: "player_name='second change'", match_events: "description='second change'", match_links: "title='second change'"})[table]}
      where ${['seats','payment_splits','watch_record_categories'].includes(table) ? `watch_record_id='${watch}'` : `match_id='${match}'`};
    ${check(`(select m.revision>old.revision and m.updated_at>old.updated_at from public.matches m, old where m.id='${match}')`)}
    update old set revision=m.revision,updated_at=m.updated_at from public.matches m where m.id='${match}';
    delete from public.${table} where ${['seats','payment_splits','watch_record_categories'].includes(table) ? `watch_record_id='${watch}'` : `match_id='${match}'`};
    ${check(`(select m.revision>old.revision and m.updated_at>old.updated_at from public.matches m, old where m.id='${match}')`)}`);
});

test('watch-owned child UPDATE and DELETE resolve OLD parent and preserve watch unit relations', () => {
  transaction(`insert into public.seats(owner_id,watch_record_id,area) values('${owner}','${watch}','A');
    insert into public.payment_splits(owner_id,watch_record_id,title,amount) values('${owner}','${watch}','split',10);
    insert into public.watch_record_categories(owner_id,watch_record_id,category_id) values('${owner}','${watch}','other');
    create temp table old as select revision from public.matches where id='${match}';
    update public.seats set area='B' where watch_record_id='${watch}';
    update public.payment_splits set title='edited' where watch_record_id='${watch}';
    update public.watch_record_categories set is_primary=true where watch_record_id='${watch}';
    ${check(`(select revision>(select revision from old) from public.matches where id='${match}')`)}
    update old set revision=(select revision from public.matches where id='${match}');
    delete from public.seats where watch_record_id='${watch}';
    delete from public.payment_splits where watch_record_id='${watch}';
    delete from public.watch_record_categories where watch_record_id='${watch}';
    ${check(`(select revision>(select revision from old) from public.matches where id='${match}')`)}
    ${check(`exists(select 1 from public.watch_records where id='${watch}') and ${countTickets}=2`)}`);
});

test('watch DELETE cascade still notifies OLD match after children lose parent lookup', () => {
  transaction(`insert into public.seats(owner_id,watch_record_id,area) values('${owner}','${watch}','A');
    insert into public.payment_splits(owner_id,watch_record_id,title,amount) values('${owner}','${watch}','split',10);
    create temp table old as select revision from public.matches where id='${match}';
    delete from public.watch_records where id='${watch}';
    ${check(`(select revision>(select revision from old) from public.matches where id='${match}')`)}
    ${check(`${countTickets}=2 and not exists(select 1 from public.payment_splits)`)}`);
});

test('ticket reparenting propagates both OLD and NEW parents in sorted order', () => {
  transaction(`insert into public.matches(id,owner_id,match_date,home_team_id,away_team_id,match_type) values('${missing}','${owner}','2026-11-07','dragons','giants','official');
    create temp table old as select id,revision from public.matches;
    update public.tickets set match_id='${missing}' where id='${a}';
    ${check(`(select bool_and(m.revision>old.revision) from public.matches m join old using(id) where m.id in ('${match}','${missing}'))`)}`);
});

test('snapshot is read-only, owner-scoped, ID-sorted and contains all aggregate keys', () => {
  const result = JSON.parse(sql(`begin read only; set local role authenticated; set local request.jwt.claim.sub='${owner}'; select ${snapshot}; rollback;`));
  assert.equal(result.match.id, match);
  assert.equal(typeof result.revision, 'string');
  assert.equal(result.match.revision, result.revision);
  assert.deepEqual(result.tickets.map(ticket => ticket.id), [a, b]);
  for (const key of ['categories','seats','splits','payments','innings','totals','pitchers','events','links']) assert.ok(Array.isArray(result[key]), key);
  transaction(rejects(`public.get_match_record_snapshot('${otherMatch}')`, '42501') + rejects(`public.get_match_record_snapshot('${missing}')`, '42501') + rejects('public.get_match_record_snapshot(null)'));
  assert.throws(() => sql(`select public.get_match_record_snapshot('invalid-uuid');`), error => String(error.stderr).includes('invalid input syntax for type uuid'));
});

test('snapshot table permission failure is surfaced instead of becoming an empty array', () => {
  assert.throws(() => sql(`begin; revoke select on public.match_links from authenticated;
    set local role authenticated; set local request.jwt.claim.sub='${owner}'; select ${snapshot};`),
    error => String(error.stderr).includes('permission denied for table match_links'));
  // Failed psql session rolled back the permission change.
  transaction(`select ${snapshot};`);
});

test('RPC and snapshot reject anonymous and unapproved callers; RLS hides other owners', () => {
  for (const [role, uid] of [['anon', owner], ['authenticated', unapproved]]) {
    for (const expression of [`public.get_match_record_snapshot('${match}')`, `public.save_match_record('{}')`]) {
      assert.throws(() => sql(`\\set VERBOSITY verbose
        begin; set local role ${role}; set local request.jwt.claim.sub='${uid}'; select ${expression};`),
        error => String(error.stderr).includes('42501'));
    }
  }
  transaction(check(`not exists(select 1 from public.matches where id='${otherMatch}') and not exists(select 1 from public.tickets where id='${foreignTicket}')`));
});

test('SECURITY INVOKER, STABLE snapshot, minimal grants, RLS and gate trigger coverage', () => {
  const result = JSON.parse(sql(`select jsonb_build_object(
    'internal_execute_denied', not has_function_privilege('authenticated','public.match_write_gate()','execute') and not has_function_privilege('authenticated','public.propagate_match_revision()','execute'),
    'all_invoker', (select bool_and(not prosecdef) from pg_proc where oid in (
      'public.save_match_record(jsonb)'::regprocedure,'public.get_match_record_snapshot(uuid)'::regprocedure,
      'public.match_write_gate()'::regprocedure,'public.propagate_match_revision()'::regprocedure,'public.protect_ticket_payments()'::regprocedure)),
    'stable', (select provolatile='s' from pg_proc where oid='public.get_match_record_snapshot(uuid)'::regprocedure),
    'anon_denied', not has_function_privilege('anon','public.save_match_record(jsonb)','execute') and not has_function_privilege('anon','public.get_match_record_snapshot(uuid)','execute'),
    'public_denied', not exists(select 1 from pg_proc p, lateral aclexplode(p.proacl) a where p.oid in ('public.save_match_record(jsonb)'::regprocedure,'public.get_match_record_snapshot(uuid)'::regprocedure) and a.grantee=0 and a.privilege_type='EXECUTE'),
    'authenticated', has_function_privilege('authenticated','public.save_match_record(jsonb)','execute') and has_function_privilege('authenticated','public.get_match_record_snapshot(uuid)','execute'),
    'gate_count', (select count(*) from pg_trigger where tgname='match_write_gate' and not tgisinternal),
    'propagation_count', (select count(*) from pg_trigger where tgname='propagate_match_revision' and not tgisinternal),
    'rls', (select bool_and(relrowsecurity) from pg_class where oid in ('public.matches'::regclass,'public.watch_records'::regclass,'public.tickets'::regclass,'public.payments'::regclass,'public.payment_splits'::regclass)),
    'pt409', position('PT409' in pg_get_functiondef('public.save_match_record(jsonb)'::regprocedure))>0,
    'no_intentional_40001', position('40001' in pg_get_functiondef('public.save_match_record(jsonb)'::regprocedure))=0
  );`));
  assert.deepEqual(result, { internal_execute_denied: true, all_invoker: true, stable: true, anon_denied: true, public_denied: true, authenticated: true, gate_count: 12, propagation_count: 11, rls: true, pt409: true, no_intentional_40001: true });
});

const roleSQL = `set local role authenticated; set local request.jwt.claim.sub='${owner}'; set local statement_timeout='6s';`;
async function waitFor(predicate, label) {
  const end = Date.now() + 5000;
  while (Date.now() < end) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  throw new Error(`Timed out waiting for ${label}`);
}
function currentPayload() {
  return sql(`select jsonb_build_object('contract_version',2,'match',jsonb_build_object('id',id,'expected_updated_at',updated_at,'expected_revision',revision::text),'ticket_changes','{}'::jsonb) from public.matches where id='${match}';`);
}
const advisoryWaiter = () => sql("select count(*) from pg_stat_activity where datname=current_database() and wait_event='advisory';") !== '0';
function abortSession(s) {
  if (!s.child.stdin.destroyed && !s.child.stdin.writableEnded) s.child.stdin.end('rollback;');
}

test('concurrent same-revision RPCs serialize; exactly one commits and the other gets PT409', async () => {
  const payload = currentPayload();
  const first = session();
  first.child.stdin.write(`begin; ${roleSQL} select public.save_match_record(${literal(payload)}::jsonb); select 'READY';\n`);
  let second;
  try {
    await waitFor(() => first.output().includes('READY'), 'first RPC lock');
    second = session(`\\set VERBOSITY verbose
      begin; ${roleSQL} select public.save_match_record(${literal(payload)}::jsonb); commit;`);
    const outcome = second.done.then(() => ({ ok: true }), error => ({ error }));
    await waitFor(advisoryWaiter, 'second RPC waiting before row locks');
    first.child.stdin.end('commit;');
    await first.done;
    const result = await outcome;
    assert.match(result.error?.message || '', /PT409/);
    assert.doesNotMatch(result.error.message, /40P01|40001/);
  } finally {
    abortSession(first);
    if (second) abortSession(second);
  }
});

test('direct ticket DML first makes waiting RPC stale without lock inversion/deadlock', async () => {
  const payload = currentPayload();
  const first = session();
  first.child.stdin.write(`begin; ${roleSQL} update public.tickets set notes='direct committed' where id='${a}'; select 'READY';\n`);
  let second;
  try {
    await waitFor(() => first.output().includes('READY'), 'direct writer lock');
    second = session(`\\set VERBOSITY verbose
      begin; ${roleSQL} select public.save_match_record(${literal(payload)}::jsonb); commit;`);
    const outcome = second.done.then(() => ({ ok: true }), error => ({ error }));
    await waitFor(advisoryWaiter, 'RPC waiting on statement gate');
    first.child.stdin.end('commit;'); await first.done;
    const result = await outcome;
    assert.match(result.error?.message || '', /PT409/);
    assert.doesNotMatch(result.error.message, /40P01/);
  } finally { abortSession(first); if (second) abortSession(second); }
});

test('RPC first and direct child writer second wait before child row locks, then complete', async () => {
  const payload = currentPayload();
  const first = session();
  first.child.stdin.write(`begin; ${roleSQL} select public.save_match_record(${literal(payload)}::jsonb); select 'READY';\n`);
  let second;
  try {
    await waitFor(() => first.output().includes('READY'), 'RPC lock');
    second = session(`begin; ${roleSQL} update public.tickets set notes='second direct' where id='${a}'; rollback;`);
    await waitFor(advisoryWaiter, 'direct writer waiting before tuple lock');
    first.child.stdin.end('rollback;'); await first.done; await second.done;
  } finally { abortSession(first); if (second) abortSession(second); }
});

test('gate lock timeout is explicit and rolls back, without an automatic retry', async () => {
  const first = session();
  first.child.stdin.write(`begin; ${roleSQL} update public.tickets set notes='uncommitted' where id='${a}'; select 'READY';\n`);
  try {
    await waitFor(() => first.output().includes('READY'), 'held gate');
    const before = sql(`select notes from public.tickets where id='${a}';`);
    assert.throws(() => sql(`\\set VERBOSITY verbose
      begin; ${roleSQL} set local lock_timeout='150ms'; update public.tickets set notes='must not save' where id='${a}'; commit;`),
      error => String(error.stderr).includes('55P03'));
    assert.equal(sql(`select notes from public.tickets where id='${a}';`), before);
    first.child.stdin.end('rollback;'); await first.done;
  } finally { abortSession(first); }
});

test('concurrent payment insertion wins before ticket deletion and remains protected', async () => {
  const first = session();
  first.child.stdin.write(`begin; ${roleSQL} insert into public.payments(owner_id,match_id,ticket_id,title,amount) values('${owner}','${match}','${a}','race',100); select 'READY';\n`);
  let second;
  try {
    await waitFor(() => first.output().includes('READY'), 'payment FK and gate');
    // Direct DELETE has no expected token; this specifically exercises the payment guard after waiting.
    second = session(`\\set VERBOSITY verbose
      begin; ${roleSQL} delete from public.tickets where id='${a}'; commit;`);
    const outcome = second.done.then(() => ({ ok: true }), error => ({ error }));
    await waitFor(advisoryWaiter, 'delete waiting for payment');
    first.child.stdin.end('commit;'); await first.done;
    const result = await outcome;
    assert.match(result.error?.message || '', /23503/);
    assert.equal(sql(`select count(*) from public.payments where ticket_id='${a}';`), '1');
    // Remove ONLY the synthetic payment created by this test, as a tested explicit user deletion.
    sql(`begin; ${roleSQL} delete from public.payments where ticket_id='${a}' and title='race'; commit;`);
  } finally { abortSession(first); if (second) abortSession(second); }
});

test('snapshot reads one committed generation while another transaction is in flight', async () => {
  const first = session();
  const before = JSON.parse(sql(`begin read only; ${roleSQL} select ${snapshot}; rollback;`));
  first.child.stdin.write(`begin; ${roleSQL}
    update public.matches set notes='snapshot-new' where id='${match}';
    update public.tickets set notes='snapshot-new' where id='${a}'; select 'READY';\n`);
  try {
    await waitFor(() => first.output().includes('READY'), 'uncommitted generation');
    const during = JSON.parse(sql(`begin read only; ${roleSQL} select ${snapshot}; rollback;`));
    assert.deepEqual(during, before);
    first.child.stdin.end('commit;'); await first.done;
    const after = JSON.parse(sql(`begin read only; ${roleSQL} select ${snapshot}; rollback;`));
    assert.equal(after.match.notes, 'snapshot-new');
    assert.equal(after.tickets.find(ticket => ticket.id === a).notes, 'snapshot-new');
    assert.ok(BigInt(after.revision) > BigInt(before.revision));
  } finally { abortSession(first); }
});

test('snapshot remains internally consistent across rapid committed multi-table generations', async () => {
  sql(`begin; ${roleSQL} update public.matches set notes='epoch-0' where id='${match}'; update public.tickets set notes='epoch-0' where id='${a}'; commit;`);
  const writer = session(Array.from({ length: 25 }, (_, i) => `begin; ${roleSQL}
    update public.matches set notes='epoch-${i+1}' where id='${match}';
    update public.tickets set notes='epoch-${i+1}' where id='${a}'; commit;`).join('\n'));
  const reader = session(Array.from({ length: 40 }, () => `begin read only; ${roleSQL} select ${snapshot}; rollback;`).join('\n'));
  const [, result] = await Promise.all([writer.done, reader.done]);
  const snapshots = result.split('\n').filter(Boolean).map(value => JSON.parse(value));
  assert.equal(snapshots.length, 40);
  for (const value of snapshots) {
    assert.equal(value.match.notes, value.tickets.find(ticket => ticket.id === a).notes);
    assert.equal(value.match.revision, value.revision);
  }
  sql(`begin; ${roleSQL} update public.matches set notes=null where id='${match}'; update public.tickets set notes=null where id='${a}'; commit;`);
});

test('end-of-run residual check: only synthetic baseline remains, no generated test rows or open transactions', () => {
  const counts = JSON.parse(sql(`select jsonb_build_object(
    'users',(select count(*) from auth.users),'matches',(select count(*) from public.matches),
    'watches',(select count(*) from public.watch_records),'tickets',(select count(*) from public.tickets),
    'payments',(select count(*) from public.payments),'splits',(select count(*) from public.payment_splits),
    'seats',(select count(*) from public.seats),'categories',(select count(*) from public.watch_record_categories),
    'innings',(select count(*) from public.match_inning_scores),'totals',(select count(*) from public.match_team_totals),
    'pitchers',(select count(*) from public.match_pitchers),'events',(select count(*) from public.match_events),
    'links',(select count(*) from public.match_links),
    'deadlocks',(select deadlocks from pg_stat_database where datname=current_database()),
    'open_transactions',(select count(*) from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() and xact_start is not null));`));
  assert.deepEqual(counts, { users: 3, matches: 2, watches: 2, tickets: 3, payments: 0, splits: 0, seats: 0, categories: 0, innings: 0, totals: 0, pitchers: 0, events: 0, links: 0, deadlocks: 0, open_transactions: 0 });
  console.log('Residual synthetic baseline: ' + JSON.stringify(counts));
});
