import type { SupabaseClient } from '@supabase/supabase-js';
import type { MatchRecord, TicketManagement } from '../../types/baseball';
import type { TicketEditorDraft } from './ticketEditorDraft';
import { ticketEditorChanges, ticketEditorHasChanges } from './ticketEditorDraft';
import { createV2SaveController, verifyV2Capability, type V2SaveController } from './adapter';
import type { MatchSnapshot } from './snapshot';
import { ticketFields } from './tickets';
import { timestampMicros, uuid } from './validation';

/** A second, deliberate opt-in. Neither switch is enabled by this patch. */
export function isV2TicketWriteEnabled(): boolean {
  return import.meta.env?.VITE_SUPABASE_ATOMIC_SAVE === 'true' &&
    import.meta.env?.VITE_SUPABASE_ATOMIC_V2_TICKET_WRITES === 'true';
}

function comparableTicket(ticket: TicketManagement) {
  return Object.fromEntries(Object.keys(ticketFields).map(key => [key,
    ticket[key as keyof TicketManagement] ?? null]));
}

/** An ordinary REST-loaded MatchRecord is NOT a v2 revision baseline. */
export function assertFreshTicketEditor(
  record: MatchRecord,
  draft: TicketEditorDraft,
  snapshot: MatchSnapshot,
): void {
  if (uuid(record.id) !== uuid(snapshot.record.id)) throw new Error('別の試合のスナップショットです。');
  if (timestampMicros(record.updatedAt) !== timestampMicros(snapshot.updatedAt)) {
    throw new Error('別の端末で試合が更新されています。画面を再読込してから編集してください。');
  }
  if (record.tickets.length !== draft.baseline.length ||
      record.tickets.length !== snapshot.record.tickets.length) {
    throw new Error('チケットの登録件数が変わっています。再読込が必要です。');
  }
  const original = new Map(record.tickets.map(ticket => [uuid(ticket.id), comparableTicket(ticket)]));
  const fromEditor = new Map(draft.baseline.map(ticket => [uuid(ticket.id), comparableTicket(ticket)]));
  const fresh = new Map(snapshot.record.tickets.map(ticket => [uuid(ticket.id), comparableTicket(ticket)]));
  if (original.size !== record.tickets.length || fromEditor.size !== draft.baseline.length || fresh.size !== snapshot.record.tickets.length) {
    throw new Error('チケットIDに重複があります。');
  }
  for (const [id, value] of original) {
    if (JSON.stringify(value) !== JSON.stringify(fromEditor.get(id)) ||
        JSON.stringify(value) !== JSON.stringify(fresh.get(id))) {
      throw new Error('チケットが別の端末で変更されています。再読込が必要です。');
    }
  }
  if (!ticketEditorHasChanges(ticketEditorChanges(draft))) {
    throw new Error('チケットの変更がありません。');
  }
}

/** Only prepares a single ticket-only RPC intent; never writes other form fields. */
export async function createTicketOnlySaveController(
  client: SupabaseClient,
  ownerId: string,
  initialRecord: MatchRecord,
  draft: TicketEditorDraft,
): Promise<V2SaveController> {
  if (!isV2TicketWriteEnabled()) throw new Error('Atomic RPC v2は未有効化です。クラウドへ送信していません。');
  ticketEditorChanges(draft); // validate locally before any capability network read
  const {capability, snapshot} = await verifyV2Capability(client, {
    contract: 'atomic_v2', ownerId, probeMatchId: initialRecord.id,
  });
  assertFreshTicketEditor(initialRecord, draft, snapshot);
  return createV2SaveController(client, capability, {
    contract: 'atomic_v2',
    record: snapshot.record,
    baseline: snapshot,
    tickets: structuredClone(draft.rows),
    deletedTicketIds: [...draft.deletedIds],
    changedDetails: [],
  });
}
