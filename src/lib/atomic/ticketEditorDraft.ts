import type { TicketManagement } from '../../types/baseball';
import { buildTicketChanges, createTicketDraft, type TicketChanges, type TicketEdit } from './tickets';

export interface TicketEditorDraft {
  baseline: TicketManagement[];
  rows: TicketEdit[];
  deletedIds: string[];
}

export function beginTicketEditor(tickets: readonly TicketManagement[]): TicketEditorDraft {
  const baseline = tickets.map(item => structuredClone(item));
  return { baseline, rows: baseline.map(item => ({ ...item })), deletedIds: [] };
}

export function addTicketRow(draft: TicketEditorDraft, clientKey: string = crypto.randomUUID()): TicketEditorDraft {
  return { ...draft, rows: [...draft.rows, createTicketDraft({ status: 'release_waiting' }, clientKey)] };
}

export function editTicketRow(draft: TicketEditorDraft, index: number, field: keyof TicketManagement, value: string | number | null): TicketEditorDraft {
  if (index < 0 || index >= draft.rows.length || field === 'id') throw new Error('Invalid ticket edit target');
  return { ...draft, rows: draft.rows.map((item, i) => i === index ? { ...item, [field]: value } : item) };
}

export function removeTicketRow(draft: TicketEditorDraft, index: number): TicketEditorDraft {
  const item = draft.rows[index];
  if (!item) throw new Error('Invalid ticket removal');
  return {
    ...draft,
    rows: draft.rows.filter((_, i) => i !== index),
    deletedIds: item.id ? [...draft.deletedIds, item.id] : draft.deletedIds,
  };
}

export function undoTicketDeletion(draft: TicketEditorDraft, id: string): TicketEditorDraft {
  if (!draft.deletedIds.includes(id)) throw new Error('Ticket is not pending deletion');
  const original = draft.baseline.find(ticket => ticket.id === id);
  if (!original) throw new Error('Original ticket not found');
  return {
    ...draft,
    deletedIds: draft.deletedIds.filter(deleted => deleted !== id),
    rows: [...draft.rows, { ...original }],
  };
}

export function ticketEditorChanges(draft: TicketEditorDraft): TicketChanges {
  return buildTicketChanges(draft.baseline, draft.rows, draft.deletedIds);
}

export function ticketEditorHasChanges(changes: TicketChanges): boolean {
  return changes.create.length + changes.update.length + changes.delete.length > 0;
}
