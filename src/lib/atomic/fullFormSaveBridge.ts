import type { SupabaseClient } from '@supabase/supabase-js';
import type { MatchRecord } from '../../types/baseball';
import { editRecordTicket } from '../../utils/ticketRecords';
import { same } from './validation';
import type { TicketEditorDraft } from './ticketEditorDraft';
import { ticketEditorChanges } from './ticketEditorDraft';
import { createV2SaveController, verifyV2Capability, type V2SaveController } from './adapter';
import { planFullFormV2 } from './fullFormPreflight';
import { isV2TicketWriteEnabled } from './ticketSaveBridge';

/** Independent third opt-in; none of these flags are changed by this patch. */
export function isV2FullFormWriteEnabled(): boolean {
  return isV2TicketWriteEnabled() &&
    import.meta.env?.VITE_SUPABASE_ATOMIC_V2_FULL_FORM_WRITES === 'true';
}

/**
 * Existing-record full-form saving only. An ordinary REST projection is never
 * accepted as a v2 revision baseline. Verify the contract and compare its
 * authoritative snapshot against every form-visible baseline BEFORE writing.
 * No fallback to v1/REST and no retry are permitted on any failure.
 */
export async function createFullFormV2SaveController(
  client: SupabaseClient,
  ownerId: string,
  original: MatchRecord,
  edited: MatchRecord,
  tickets: TicketEditorDraft,
): Promise<V2SaveController> {
  if (!isV2FullFormWriteEnabled()) {
    throw new Error('フォーム全体のAtomic RPC v2保存は無効です。送信していません。');
  }
  ticketEditorChanges(tickets); // reject invalid edits before any network request
  const { capability, snapshot } = await verifyV2Capability(client, {
    contract: 'atomic_v2', ownerId, probeMatchId: original.id,
  });
  const intent = planFullFormV2(original, edited, snapshot, tickets);
  return createV2SaveController(client, capability, intent);
}

/** Compose the legacy single-ticket controls without ever truncating multiple tickets. */
export function assembleFullFormEdit(
  original: MatchRecord,
  input: Omit<MatchRecord,'id'|'createdAt'|'updatedAt'|'tickets'>,
  multiTicketTouched: boolean,
): {record: MatchRecord; useMultiDraft: boolean} {
  const legacyChanged = !same(original.ticketInfo, input.ticketInfo);
  if ((multiTicketTouched || original.tickets.length > 1) && legacyChanged) {
    throw new Error('単一チケット欄と複数チケット管理を同時には保存できません。複数チケット側で編集してください。');
  }
  if (!multiTicketTouched && original.tickets.length === 0 &&
      (input.ticketInfo.status !== 'release_waiting' || Object.entries(input.ticketInfo).some(([key,value]) =>
        key !== 'status' && value !== undefined && value !== ''))) {
    throw new Error('新規チケットは複数チケット編集欄で追加してください。安定した一時キーが必要です。');
  }
  const record: MatchRecord = {
    ...input, id: original.id, createdAt: original.createdAt,
    updatedAt: original.updatedAt, tickets: structuredClone(original.tickets),
  };
  return {
    record: multiTicketTouched || original.tickets.length > 1 ? record : editRecordTicket(record,input.ticketInfo),
    useMultiDraft: multiTicketTouched,
  };
}
