import assert from 'node:assert/strict';
import test from 'node:test';
import { MUTATION_CONFIRMATION, createTestIds, isConcurrencyConflict, mutationMode, targetColumn } from './verify-phase2a-rest.mjs';

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

test('concurrency errors are recognized across PostgREST response shapes', () => {
  assert.equal(isConcurrencyConflict({ code: '40001' }), true);
  assert.equal(isConcurrencyConflict({ status: 409, message: 'Conflict' }), true);
  assert.equal(isConcurrencyConflict({ status: 400, message: 'database error' }), false);
  assert.equal(isConcurrencyConflict({ code: 'P0001', message: 'match was modified by another session' }), true);
  assert.equal(isConcurrencyConflict({ code: '42501', status: 403 }), false);
  assert.equal(isConcurrencyConflict(undefined), false);
});
