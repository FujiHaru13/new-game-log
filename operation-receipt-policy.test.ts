import test from 'node:test';
import assert from 'node:assert/strict';
import { assessOperationReceipt, type OperationIdentity } from './src/lib/atomic/operationReceiptPolicy.ts';
const id: OperationIdentity = {
  ownerId: '10000000-0000-4000-8000-000000000001',
  matchId: '20000000-0000-4000-8000-000000000002',
  attemptId: '30000000-0000-4000-8000-000000000003',
  payloadDigest: 'a'.repeat(64),
};
const receipt = { ...id, outcome: 'committed', revision: '9007199254740993', updatedAt: '2026-11-11T12:00:00.123456+09:00', committedAt: '2026-11-11T12:00:00.123456+09:00' };
test('matching durable committed receipt is evidence but never auto-unlocks', () => {
  const decision = assessOperationReceipt(id, { kind: 'receipt', receipt });
  assert.equal(decision.kind, 'verified_commit');
  assert.equal(decision.mayReleaseAutomatically, false);
  if (decision.kind === 'verified_commit') assert.equal(decision.receipt.revision, '9007199254740993');
});
test('missing operation receipt never proves the save did not happen', () => {
  assert.deepEqual(assessOperationReceipt(id, { kind: 'not_found' }), { kind: 'unresolved', reason: 'missing', mayReleaseAutomatically: false });
});
test('network and authorization failures fail closed', () => {
  for (const kind of ['unavailable', 'unauthorized'] as const) {
    assert.equal(assessOperationReceipt(id, { kind }).kind, 'unresolved');
  }
});
test('another operation or another owner cannot confirm the pending save', () => {
  for (const key of ['attemptId', 'ownerId', 'matchId', 'payloadDigest'] as const) {
    const altered = { ...receipt, [key]: key === 'payloadDigest' ? 'b'.repeat(64) : '40000000-0000-4000-8000-000000000004' };
    assert.deepEqual(assessOperationReceipt(id, { kind: 'receipt', receipt: altered }), {kind:'unresolved',reason:'mismatch',mayReleaseAutomatically:false});
  }
});
test('snapshot-like object, malformed and failed outcomes cannot confirm', () => {
  for (const value of [null, {}, { ...receipt, outcome: 'rejected' }, { ...receipt, revision: 4 }, { ...receipt, updatedAt: 'bad' }]) {
    assert.equal(assessOperationReceipt(id, { kind: 'receipt', receipt: value }).kind, 'unresolved');
  }
});
test('invalid local operation identity fails closed', () => {
  assert.deepEqual(assessOperationReceipt({ ...id, attemptId: 'not-a-uuid' }, { kind: 'receipt', receipt }), {kind:'unresolved',reason:'invalid',mayReleaseAutomatically:false});
});
