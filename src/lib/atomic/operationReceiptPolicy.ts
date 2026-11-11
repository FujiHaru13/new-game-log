/** R2-C DESIGN ONLY: receipt evidence validation. This module never clears a pending save. */
export interface OperationIdentity {
  ownerId: string;
  matchId: string;
  attemptId: string;
  payloadDigest: string;
}
export interface CommittedReceipt extends OperationIdentity {
  outcome: 'committed';
  revision: string;
  updatedAt: string;
  committedAt: string;
}
export type ReceiptLookup =
  | { kind: 'receipt'; receipt: unknown }
  | { kind: 'not_found' }
  | { kind: 'unavailable' }
  | { kind: 'unauthorized' };
export type ReceiptDecision =
  | { kind: 'verified_commit'; receipt: CommittedReceipt; mayReleaseAutomatically: false }
  | { kind: 'unresolved'; reason: 'missing' | 'unavailable' | 'unauthorized' | 'invalid' | 'mismatch'; mayReleaseAutomatically: false };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[0-9a-f]{64}$/i;
const REVISION = /^(0|[1-9][0-9]*)$/;
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function validIdentity(value: OperationIdentity): boolean {
  return UUID.test(value.ownerId) && UUID.test(value.matchId) && UUID.test(value.attemptId) && SHA256.test(value.payloadDigest);
}
/**
 * Only a server-side committed receipt matching ALL identity fields is positive evidence.
 * No missing row, matching snapshot, client success message or timer is proof of failure.
 * Even verified_commit is not permission to clear storage: higher layers must complete
 * a separately reviewed reconciliation protocol and require explicit authorization.
 */
export function assessOperationReceipt(identity: OperationIdentity, lookup: ReceiptLookup): ReceiptDecision {
  if (!validIdentity(identity)) return { kind: 'unresolved', reason: 'invalid', mayReleaseAutomatically: false };
  if (lookup.kind === 'not_found') return { kind: 'unresolved', reason: 'missing', mayReleaseAutomatically: false };
  if (lookup.kind === 'unavailable') return { kind: 'unresolved', reason: 'unavailable', mayReleaseAutomatically: false };
  if (lookup.kind === 'unauthorized') return { kind: 'unresolved', reason: 'unauthorized', mayReleaseAutomatically: false };
  const raw = lookup.receipt;
  if (!isRecord(raw) || raw.outcome !== 'committed' ||
      typeof raw.ownerId !== 'string' || typeof raw.matchId !== 'string' ||
      typeof raw.attemptId !== 'string' || typeof raw.payloadDigest !== 'string' ||
      typeof raw.revision !== 'string' || !REVISION.test(raw.revision) ||
      typeof raw.updatedAt !== 'string' || Number.isNaN(Date.parse(raw.updatedAt)) ||
      typeof raw.committedAt !== 'string' || Number.isNaN(Date.parse(raw.committedAt))) {
    return { kind: 'unresolved', reason: 'invalid', mayReleaseAutomatically: false };
  }
  if (raw.ownerId.toLowerCase() !== identity.ownerId.toLowerCase() ||
      raw.matchId.toLowerCase() !== identity.matchId.toLowerCase() ||
      raw.attemptId.toLowerCase() !== identity.attemptId.toLowerCase() ||
      raw.payloadDigest.toLowerCase() !== identity.payloadDigest.toLowerCase()) {
    return { kind: 'unresolved', reason: 'mismatch', mayReleaseAutomatically: false };
  }
  return { kind: 'verified_commit', receipt: raw as unknown as CommittedReceipt, mayReleaseAutomatically: false };
}
