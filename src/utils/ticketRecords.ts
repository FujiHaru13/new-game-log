import type { MatchRecord, TicketManagement } from '../types/baseball';

export const emptyTicket = (): TicketManagement => ({ status: 'release_waiting' });
const statuses = ['release_waiting', 'plan_to_buy', 'purchased', 'ticket_waiting', 'ticketed', 'cancelled_refund'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateTicket(value: unknown): asserts value is TicketManagement {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('不正なチケット情報です');
  const ticket = value as TicketManagement;
  if (!statuses.includes(ticket.status)) throw new Error('不正なチケット状態です');
  if (ticket.id !== undefined && (typeof ticket.id !== 'string' || !uuid.test(ticket.id))) throw new Error('不正なチケットIDです');
  for (const [key, field] of Object.entries(ticket)) {
    if (field === undefined) continue;
    if (key === 'quantity') {
      if (typeof field !== 'number' || !Number.isInteger(field) || field < 0) throw new Error('不正なチケット枚数です');
    } else if (typeof field !== 'string') throw new Error('不正なチケット項目です');
  }
}

// The old default status alone is a display placeholder, not evidence of a ticket.
export function hasTicket(ticket: TicketManagement): boolean {
  return ticket.status !== 'release_waiting' || Object.entries(ticket).some(([key, value]) => key !== 'status' && value !== undefined && value !== '');
}

export function normalizeRecordTickets<T extends { ticketInfo: TicketManagement; tickets?: TicketManagement[] }>(record: T): T & { tickets: TicketManagement[] } {
  let tickets: TicketManagement[];
  if (record.tickets === undefined) {
    validateTicket(record.ticketInfo);
    tickets = hasTicket(record.ticketInfo) ? [{ ...record.ticketInfo }] : [];
  } else {
    if (!Array.isArray(record.tickets)) throw new Error('不正なチケット配列です');
    record.tickets.forEach(validateTicket);
    tickets = record.tickets.map(ticket => ({ ...ticket }));
    const ids = tickets.flatMap(ticket => ticket.id ? [ticket.id] : []);
    if (new Set(ids).size !== ids.length) throw new Error('チケットIDが重複しています');
  }
  return { ...record, tickets, ticketInfo: tickets[0] ? { ...tickets[0] } : emptyTicket() };
}

export function editRecordTicket(record: MatchRecord, fields: Partial<TicketManagement>): MatchRecord {
  const normalized = normalizeRecordTickets(record);
  if (normalized.tickets.length > 1) throw new Error('複数チケットがあるため保存できません');
  const edited = { ...normalized.ticketInfo, ...fields };
  return normalizeRecordTickets({ ...normalized, tickets: normalized.tickets.length || hasTicket(edited) ? [edited] : [] });
}

export function normalizeStoredRecords(value: unknown): MatchRecord[] {
  if (!Array.isArray(value)) throw new Error('不正な記録配列です');
  return value.map(record => {
    if (!record || typeof record !== 'object') throw new Error('不正な記録です');
    return normalizeRecordTickets(record as MatchRecord);
  });
}
