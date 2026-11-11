import type { SupabaseClient } from '@supabase/supabase-js';
import { verifyV2Capability } from './adapter';
import { readPendingSave, type PendingSaveMarker } from './pendingSaveGuard';

/**
 * A fresh read is NOT proof that an ambiguous write committed (or did not commit).
 * The v2 database does not persist an attempt ID, so this module never clears a
 * pending marker or changes any match data. Confirmation requires a future
 * operation-receipt contract or independent administrative investigation.
 */
export type PendingReview =
  | { status: 'none'; message: string }
  | { status: 'observed_unproven'; attemptId: string; revision: string; updatedAt: string; message: string }
  | { status: 'unavailable'; attemptId?: string; message: string };

export async function reviewPendingSaveReadOnly(
  client: SupabaseClient,
  ownerId: string,
  matchId: string,
  storage?: Storage,
  fetchSnapshot: typeof verifyV2Capability = verifyV2Capability,
): Promise<PendingReview> {
  let marker: PendingSaveMarker | null;
  try { marker = readPendingSave(ownerId, matchId, storage); }
  catch { return {status: 'unavailable', message: '確認待ち記録を安全に読み取れません。保存・削除は禁止のままです。'}; }
  if (!marker) return { status: 'none', message: 'この端末には確認待ち記録がありません。過去の送信結果を保証するものではありません。' };
  try {
    const { snapshot } = await fetchSnapshot(client, {
      contract: 'atomic_v2', ownerId, probeMatchId: matchId,
    });
    // Re-read marker after network I/O. Never show another attempt's read as evidence.
    const current = readPendingSave(ownerId, matchId, storage);
    if (!current || current.attemptId !== marker.attemptId) {
      return {status: 'unavailable', attemptId: marker.attemptId, message: '確認中に保存確認記録が変更されました。判断できません。'};
    }
    return {
      status: 'observed_unproven', attemptId: marker.attemptId,
      revision: snapshot.revision, updatedAt: snapshot.updatedAt,
      message: 'DBの現在状態を読み取りました。ただし今回の送信が成功・失敗した証拠にはなりません。保存・削除の停止を維持します。',
    };
  } catch {
    return {status:'unavailable', attemptId: marker.attemptId,
      message:'DB状態を安全に確認できませんでした。RPC未対応・権限・通信障害などが考えられます。保存・削除の停止を維持します。'};
  }
}
