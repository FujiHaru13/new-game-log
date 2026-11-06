import assert from 'node:assert/strict';
import { verifyTarget, sql, file } from './harness.mjs';

console.log(JSON.stringify(verifyTarget()));
assert.equal(sql("select count(*) from pg_tables where schemaname in ('public', 'auth');"), '0', 'Initialization requires a fresh dedicated DB');
sql(file('./bootstrap.sql'));
for (const name of ['0001_initial_schema.sql', '0002_rls_policies.sql', '0003_views_functions.sql', '0004_seed_master_data.sql', '0005_restrict_function_execute.sql', '0006_seed_seat_types.sql', '0007_phase2_atomic_save.sql', '0008_phase2_conflict_pt409.sql']) {
  sql(file(`../../migrations/${name}`));
}
sql(file('./fixtures.sql'));
const baseline = () => sql(`select jsonb_build_object(
 'matches', (select jsonb_agg(to_jsonb(m) - 'revision' order by id) from public.matches m),
 'watches', (select jsonb_agg(to_jsonb(w) order by id) from public.watch_records w),
 'tickets', (select jsonb_agg(to_jsonb(t) order by id) from public.tickets t),
 'policies', (select jsonb_agg(to_jsonb(p) order by tablename, policyname) from pg_policies p where schemaname='public'));`);
const before = baseline();
const migration = file('../../migrations/0009_phase2_multi_ticket_atomic.sql');
sql(migration);
assert.equal(baseline(), before, '0009 must preserve preexisting data and RLS policies');
const revisionBefore = sql('select jsonb_agg(to_jsonb(m) order by id) from public.matches m;');
sql(migration);
assert.equal(baseline(), before, 'Reapplication must preserve data');
assert.equal(sql('select jsonb_agg(to_jsonb(m) order by id) from public.matches m;'), revisionBefore, 'Reapplication must not bump revisions or clocks');
console.log('PASS: 0001-0008 + 0009 initial application, reapplication, data and RLS preservation');
