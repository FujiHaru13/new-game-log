import assert from 'node:assert/strict';
import test from 'node:test';
import { MUTATION_CONFIRMATION, createTestIds, mutationMode, targetColumn } from './verify-phase2a-rest.mjs';

test('Phase 2A REST verification is read-only by default', () => {
  assert.equal(mutationMode({}), false);
  assert.equal(mutationMode({ PHASE2A_ALLOW_MUTATIONS: '1' }), false);
  assert.equal(mutationMode({ PHASE2A_CONFIRMATION: MUTATION_CONFIRMATION }), false);
});

test('mutation mode requires both explicit controls', () => {
  assert.equal(mutationMode({
    PHASE2A_ALLOW_MUTATIONS: '1',
    PHASE2A_CONFIRMATION: MUTATION_CONFIRMATION,
  }), true);
  assert.equal(mutationMode({
    PHASE2A_ALLOW_MUTATIONS: '1',
    PHASE2A_CONFIRMATION: 'wrong',
  }), false);
});

test('test IDs are unique UUIDs and seats use watch_record_id', () => {
  const ids = createTestIds();
  assert.notEqual(ids.match, ids.watch);
  assert.notEqual(ids.match, ids.ticket);
  assert.match(ids.match, /^[0-9a-f-]{36}$/);
  assert.equal(targetColumn('seats'), 'watch_record_id');
  assert.equal(targetColumn('matches'), 'id');
});
