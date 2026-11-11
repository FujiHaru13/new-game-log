/**
 * Durable fail-closed marker for a potentially dispatched v2 write.
 * No payload, names, tickets, credentials, or entire records are persisted.
 * A read-only snapshot alone cannot prove a timed-out write succeeded or failed.
 */
export type PendingSaveKind = 'ticket' | 'full_form';
export type PendingSavePhase = 'attempting' | 'partial_or_unknown' | 'saved_syncing' | 'saved_sync_failed';
export interface PendingSaveMarker {
  version: 1;
  ownerId: string;
  matchId: string;
  kind: PendingSaveKind;
  phase: PendingSavePhase;
  attemptId: string;
  startedAt: string;
}

const PREFIX = 'new_game_log:atomic_v2_pending:v1:';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function id(value: string): string {
  if (!UUID.test(value)) throw new Error('保存対象のIDが不正です。');
  return value.toLowerCase();
}
function store(storage?: Storage): Storage {
  if (storage) return storage;
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('保存確認記録を利用できません。安全のためv2保存を停止しました。');
  }
  return window.localStorage;
}
function itemKey(ownerId: string, matchId: string): string {
  return `${PREFIX}${id(ownerId)}:${id(matchId)}`;
}
function parse(value: string, ownerId: string, matchId: string): PendingSaveMarker {
  let candidate: unknown;
  try { candidate = JSON.parse(value); } catch { throw new Error('保存確認記録が破損しています。自動再送信できません。'); }
  if (!candidate || typeof candidate !== 'object') throw new Error('保存確認記録が不正です。');
  const m = candidate as Partial<PendingSaveMarker>;
  if (m.version !== 1 || m.ownerId !== id(ownerId) || m.matchId !== id(matchId) ||
      !['ticket', 'full_form'].includes(m.kind || '') ||
      !['attempting', 'partial_or_unknown', 'saved_syncing', 'saved_sync_failed'].includes(m.phase || '') ||
      typeof m.attemptId !== 'string' || !UUID.test(m.attemptId) ||
      typeof m.startedAt !== 'string' || Number.isNaN(Date.parse(m.startedAt))) {
    throw new Error('保存確認記録が不正です。自動再送信できません。');
  }
  return m as PendingSaveMarker;
}
export function readPendingSave(ownerId: string, matchId: string, storage?: Storage): PendingSaveMarker | null {
  try {
    const value = store(storage).getItem(itemKey(ownerId, matchId));
    return value === null ? null : parse(value, ownerId, matchId);
  } catch (error) {
    throw new Error(`保存確認記録を読み取れません。安全のため書き込みを停止します。${error instanceof Error ? error.message : ''}`);
  }
}
export function assertNoPendingSave(ownerId: string, matchId: string, storage?: Storage): void {
  const pending = readPendingSave(ownerId, matchId, storage);
  if (pending) throw new Error(`この試合には確認待ちの保存があります（${pending.startedAt}）。再送信・通常保存・削除を停止しました。読み取りと手動照合が必要です。`);
}
export function beginPendingSave(ownerId: string, matchId: string, kind: PendingSaveKind, storage?: Storage): PendingSaveMarker {
  assertNoPendingSave(ownerId, matchId, storage);
  const marker: PendingSaveMarker = {
    version: 1, ownerId: id(ownerId), matchId: id(matchId), kind,
    phase: 'attempting', attemptId: crypto.randomUUID(), startedAt: new Date().toISOString(),
  };
  try {
    store(storage).setItem(itemKey(ownerId, matchId), JSON.stringify(marker));
    const reread = readPendingSave(ownerId, matchId, storage);
    if (reread?.attemptId !== marker.attemptId) throw new Error('保存確認記録を検証できません。');
    return marker;
  } catch (error) {
    throw new Error(`保存確認記録を確保できないため送信を停止しました。${error instanceof Error ? error.message : ''}`);
  }
}
export function markPendingSave(marker: PendingSaveMarker, phase: PendingSavePhase, storage?: Storage): void {
  const current = readPendingSave(marker.ownerId, marker.matchId, storage);
  if (!current || current.attemptId !== marker.attemptId) throw new Error('保存確認記録が変更されています。再送信しないでください。');
  try {
    store(storage).setItem(itemKey(marker.ownerId, marker.matchId), JSON.stringify({...marker, phase}));
  } catch { /* original marker remains fail-closed */ }
}
/** Only call after a confirmed, unambiguous rejection OR completed snapshot sync. */
export function clearConfirmedPendingSave(marker: PendingSaveMarker, storage?: Storage): void {
  const current = readPendingSave(marker.ownerId, marker.matchId, storage);
  if (!current || current.attemptId !== marker.attemptId) throw new Error('保存確認記録が一致しないため解除しません。');
  store(storage).removeItem(itemKey(marker.ownerId, marker.matchId));
}
