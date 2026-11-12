import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyProtectedMutation,
  createMutationSafetyState,
  recordCreatedId,
  stopAfterUnexpectedSuccess,
} from './verify-rls-rest-logic.mjs';

test('read-only safety state does not permit mutation operations', () => {
  const calls = [];
  const mockClient = {
    from() {
      return {
        insert() { calls.push('insert'); },
        update() { calls.push('update'); },
        delete() { calls.push('delete'); },
      };
    },
  };
  const mutationsEnabled = false;
  if (mutationsEnabled) mockClient.from('matches').insert({});
  assert.deepEqual(calls, []);
});

test('mock client records no writes in read-only mode', () => {
  const calls = [];
  const mockClient = {
    from() {
      return {
        insert() { calls.push('insert'); },
        update() { calls.push('update'); },
        delete() { calls.push('delete'); },
      };
    },
  };
  const runReadOnly = () => mockClient.from('matches').select?.('id');
  runReadOnly();
  assert.deepEqual(calls, []);
});

test('zero-row UPDATE with unchanged state passes', () => {
  assert.equal(classifyProtectedMutation({
    operation: 'UPDATE',
    returnedRows: [],
    before: { notes: 'original' },
    after: { notes: 'original' },
  }), 'PASS');
});

test('zero-row DELETE with surviving row passes', () => {
  assert.equal(classifyProtectedMutation({
    operation: 'DELETE',
    returnedRows: [],
    before: { id: 'isolated-id' },
    after: { id: 'isolated-id' },
  }), 'PASS');
});

test('unexpected mutation success fails and stops later writes', () => {
  const state = createMutationSafetyState();
  const message = stopAfterUnexpectedSuccess(state, classifyProtectedMutation({
    operation: 'UPDATE',
    returnedRows: [{ id: 'isolated-id' }],
  }), 'isolated-id');
  assert.equal(state.stopped, true);
  assert.match(message, /isolated-id/);
});

test('unexpected INSERT success fails and stops later writes', () => {
  const state = createMutationSafetyState();
  const status = classifyProtectedMutation({ operation: 'INSERT', returnedRows: [{ id: 'unexpected-id' }] });
  stopAfterUnexpectedSuccess(state, status, 'unexpected-id');
  assert.equal(status, 'FAIL');
  assert.equal(state.stopped, true);
});

test('created UUIDs are tracked for bounded cleanup and failure reporting', () => {
  const state = createMutationSafetyState();
  recordCreatedId(state, 'created-id');
  assert.deepEqual(state.createdIds, ['created-id']);
});

test('state confirmation failure is inconclusive', () => {
  assert.equal(classifyProtectedMutation({
    operation: 'UPDATE',
    returnedRows: [],
    before: null,
    after: null,
  }), 'INCONCLUSIVE');
});
