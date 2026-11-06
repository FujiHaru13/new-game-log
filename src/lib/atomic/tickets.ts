import type { TicketManagement } from '../../types/baseball';
import { date, exactKeys, object, same, uuid, type JsonObject } from './validation';

export const ticketFields = {
  status: 'status', releaseDate: 'release_date', purchaseDate: 'purchase_date', issueDate: 'issue_date',
  paymentDeadline: 'payment_deadline', quantity: 'quantity', seatTypeName: 'seat_type_name', seatArea: 'seat_area',
  seatRow: 'seat_row', seatNumber: 'seat_number', ticketType: 'ticket_type', vendor: 'vendor', notes: 'notes',
  purchaseAmount: 'purchase_amount', myExpense: 'my_expense', refundAmount: 'refund_amount', refundStatus: 'refund_status',
} as const;
export type AtomicTicket = TicketManagement & { purchaseAmount?: number; myExpense?: number; refundAmount?: number; refundStatus?: 'none'|'pending'|'completed' };
export type TicketEdit = { id?: string; clientKey?: string } & { [K in keyof AtomicTicket]?: AtomicTicket[K] | null };
export interface TicketChanges {
  create: Array<{ client_key: string; values: JsonObject }>;
  update: Array<{ id: string; changes: JsonObject }>;
  delete: string[];
}
export const ticketStatuses = ['release_waiting','plan_to_buy','purchased','ticket_waiting','ticketed','cancelled_refund'];
export const refundStatuses = ['none','pending','completed'];
export function validateTicketField(key: keyof typeof ticketFields, value: unknown) {
  if (value === null) { if (key==='status' || key==='refundStatus') throw new Error('Status cannot be null'); return; }
  if (key==='quantity') {
    if (typeof value!=='number' || !Number.isInteger(value) || value<=0 || value>2147483647) throw new Error('Invalid ticket quantity');
  } else if (['purchaseAmount','myExpense','refundAmount'].includes(key)) {
    if (typeof value!=='number' || !Number.isFinite(value) || value<0 || value>9999999999.99) throw new Error('Invalid ticket amount');
  } else {
    if (typeof value!=='string') throw new Error('Invalid ticket string');
    if (['releaseDate','purchaseDate','issueDate','paymentDeadline'].includes(key)) date(value);
    if (key==='status' && !ticketStatuses.includes(value)) throw new Error('Invalid ticket status');
    if (key==='refundStatus' && !refundStatuses.includes(value)) throw new Error('Invalid refund status');
  }
}
function fields(value: unknown): JsonObject {
  const row = object(value,'ticket');
  exactKeys(row, [], ['id','clientKey',...Object.keys(ticketFields)]);
  const result: JsonObject = {};
  for (const [key, target] of Object.entries(ticketFields)) {
    if (row[key] === undefined) continue; // omitted/undefined preserves; explicit null clears
    validateTicketField(key as keyof typeof ticketFields,row[key]); result[target]=row[key];
  }
  return result;
}
export function createTicketDraft(values: Omit<TicketEdit,'id'|'clientKey'> = {}, clientKey: string = crypto.randomUUID()): TicketEdit {
  const draft={...values,clientKey}; fields(draft);
  if (!clientKey.trim()) throw new Error('client_key is required');
  return draft;
}
export function buildTicketChanges(baseline: readonly AtomicTicket[], edited: readonly TicketEdit[], deletedIds: readonly string[] = []): TicketChanges {
  if (!Array.isArray(baseline) || !Array.isArray(edited) || !Array.isArray(deletedIds)) throw new Error('Invalid ticket arrays');
  const base = new Map<string,JsonObject>();
  for (const ticket of baseline) {
    const values=fields(ticket), id=uuid(ticket.id);
    if (!ticketStatuses.includes(ticket.status) || base.has(id)) throw new Error('Invalid/duplicate baseline ticket');
    base.set(id,values);
  }
  const result: TicketChanges={ create:[],update:[],delete:[] }, keys=new Set<string>(), ids=new Set<string>();
  for (const ticket of edited) {
    const values=fields(ticket);
    if (ticket.id !== undefined) {
      const id=uuid(ticket.id);
      if (ids.has(id) || !base.has(id) || ticket.clientKey !== undefined) throw new Error('Invalid/duplicate existing ticket');
      ids.add(id);
      const changes=Object.fromEntries(Object.entries(values).filter(([key,value]) => !same(base.get(id)![key] ?? null,value)));
      if (Object.keys(changes).length) result.update.push({id,changes});
    } else {
      const key=ticket.clientKey;
      if (typeof key!=='string' || !key.trim() || keys.has(key)) throw new Error('Invalid/duplicate client_key');
      keys.add(key); result.create.push({client_key:key,values});
    }
  }
  for (const value of deletedIds) {
    const id=uuid(value);
    if (!base.has(id) || result.delete.includes(id) || ids.has(id)) throw new Error('Invalid/overlapping deletion');
    result.delete.push(id);
  }
  // Missing existing tickets are retained; only explicit deletion IDs remove them.
  return result;
}
