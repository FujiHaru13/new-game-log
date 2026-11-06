import assert from 'node:assert/strict';
import test from 'node:test';
import { isAtomicSaveConflict, saveMatchRecordAtomic, toMatchRecord } from './src/lib/supabaseRecords';
import type { MatchRecord } from './src/types/baseball';
import type { SupabaseClient } from '@supabase/supabase-js';

const record: MatchRecord = {
  id: '00000000-0000-0000-0000-000000000001',
  date: '2026-11-06',
  time: '18:00',
  isDateUnknown: false,
  homeTeamId: 'dragons',
  awayTeamId: 'giants',
  stadiumId: 'vantelin_dome',
  matchType: 'official',
  matchStatus: 'finished',
  homeScore: 2,
  awayScore: 0,
  isScoreConfirmed: true,
  innings: { home: [1, null], away: [0, null], homeHits: 4, awayHits: 3, homeErrors: 0, awayErrors: 1 },
  pitchers: { homeStarter: 'Home', winningPitcher: 'Home' },
  homeRuns: ['Batter'],
  events: 'A notable event',
  links: [{ title: 'Box score', url: 'https://example.test/box' }],
  watchStatus: 'watched',
  cheerTeamId: 'dragons',
  categories: ['dragons_1st'],
  primaryCategory: 'dragons_1st',
  seatInfo: {},
  costInfo: { splits: [{ id: 'split-1', title: 'Ticket', amount: 1000 }] },
  ticketInfo: { status: 'ticketed', quantity: 1, vendor: 'Vendor' },
  tickets: [{ status: 'ticketed', quantity: 1, vendor: 'Vendor' }],
  createdAt: '2026-11-06T00:00:00Z',
  updatedAt: '2026-11-06T00:00:00Z',
};

test('atomic save recognizes PT409 and HTTP 409 conflicts', () => {
  assert.equal(isAtomicSaveConflict({ code: 'PT409' }), true);
  assert.equal(isAtomicSaveConflict({ status: 409 }), true);
  assert.equal(isAtomicSaveConflict({ code: 'PGRST', message: 'Conflict' }), false);
});

test('record loading retains all tickets with stable IDs and order', () => {
  const match = {
    id: 'match-1',
    match_date: '2026-11-06',
    date_unknown: false,
    start_time: null,
    home_team_id: 'dragons',
    away_team_id: 'giants',
    stadium_id: null,
    stadium_custom_name: null,
    match_type: 'official',
    match_status: 'finished',
    home_score: 1,
    away_score: 0,
    score_confirmed: true,
    duration_minutes: null,
    events: null,
    notes: null,
    created_at: '2026-11-06T00:00:00Z',
    updated_at: '2026-11-06T00:00:00Z',
  } as any;
  const record = toMatchRecord(match, undefined, [], undefined, [
    { id: '00000000-0000-0000-0000-00000000000b', match_id: 'match-1', status: 'ticketed', quantity: 2 },
    { id: '00000000-0000-0000-0000-00000000000a', match_id: 'match-1', status: 'purchased', quantity: 1 },
  ] as any);
  assert.deepEqual(record.tickets.map(ticket => ticket.id), ['00000000-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-00000000000b']);
  assert.equal(record.ticketInfo.id, '00000000-0000-0000-0000-00000000000a');
  assert.equal(record.tickets[1].quantity, 2);
});

test('atomic save returns the database updated_at after success', async () => {
  const client = mockClient(
    { data: { ok: true, match_id: record.id, watch_record_id: '00000000-0000-0000-0000-000000000002' } },
    { updatedAt: '2026-11-06T00:00:01.123456Z' },
  );
  const response = await saveMatchRecordAtomic(client, '00000000-0000-0000-0000-000000000003', record);
  assert.equal(response.updated_at, '2026-11-06T00:00:01.123456Z');
});

function mockClient(
  rpcResult: { data?: unknown; error?: { message: string } },
  options: { ticketIds?: string[]; updatedAt?: string } = {},
): SupabaseClient & {
  calls: Array<{ table: string; method: string }>;
} {
  const calls: Array<{ table: string; method: string }> = [];
  return {
    calls,
    from(table: string) {
      return {
        select(columns?: string) {
          return {
            eq() {
              return {
                data: table === 'tickets'
                  ? (options.ticketIds || []).map(id => ({ id }))
                  : { updated_at: options.updatedAt || record.updatedAt },
                error: null,
                maybeSingle: async () => ({ data: null, error: null }),
                single: async () => ({
                  data: columns === 'updated_at'
                    ? { updated_at: options.updatedAt || record.updatedAt }
                    : null,
                  error: null,
                }),
              };
            },
          };
        },
      };
    },
    rpc: async (_name: string, args: { p_payload: Record<string, unknown> }) => {
      calls.push({ table: JSON.stringify(args.p_payload), method: 'rpc' });
      return rpcResult;
    },
  } as unknown as SupabaseClient & { calls: Array<{ table: string; method: string }> };
}

test('atomic save sends all detail collections and explicit replace flags', async () => {
  const client = mockClient({
    data: { ok: true, match_id: record.id, watch_record_id: '00000000-0000-0000-0000-000000000002' },
  });
  await saveMatchRecordAtomic(client, '00000000-0000-0000-0000-000000000003', record);
  const payload = JSON.parse(client.calls[0].table) as Record<string, any>;
  assert.equal(payload.match.id, record.id);
  assert.equal(payload.innings.homeHits, 4);
  assert.deepEqual(payload.home_runs, ['Batter']);
  assert.equal(payload.replace.innings, true);
  assert.equal(payload.replace.splits, true);
  assert.equal(payload.match.expected_updated_at, record.updatedAt);
  assert.equal(payload.ticket.id, null);
});

test('payload keeps the optimistic concurrency value for existing records', async () => {
  const client = mockClient({
    data: { ok: true, match_id: record.id, watch_record_id: '00000000-0000-0000-0000-000000000002' },
  });
  await saveMatchRecordAtomic(client, '00000000-0000-0000-0000-000000000003', record, { replaceDetails: false });
  const payload = JSON.parse(client.calls[0].table) as Record<string, any>;
  assert.equal(payload.match.expected_updated_at, record.updatedAt);
  assert.equal(payload.replace.innings, false);
  assert.equal(payload.replace.links, false);
});

test('inning payload preserves zero, missing, and X as distinct values', async () => {
  const client = mockClient({
    data: { ok: true, match_id: record.id, watch_record_id: '00000000-0000-0000-0000-000000000002' },
  });
  const inningRecord = {
    ...record,
    innings: {
      home: [0, 'X', null] as (number | 'X' | null)[],
      away: [null, 0, null],
    },
  };
  await saveMatchRecordAtomic(client, '00000000-0000-0000-0000-000000000003', inningRecord);
  const payload = JSON.parse(client.calls[0].table) as Record<string, any>;
  assert.deepEqual(payload.innings.home, [0, 'X', null]);
  assert.deepEqual(payload.innings.away, [null, 0, null]);
});

test('atomic save rejects an invalid RPC success response', async () => {
  const client = mockClient({ data: { ok: true, match_id: record.id }, error: undefined });
  await assert.rejects(
    saveMatchRecordAtomic(client, '00000000-0000-0000-0000-000000000003', record),
    /応答を検証できませんでした/,
  );
});

test('atomic save surfaces RPC failure without fallback writes', async () => {
  const client = mockClient({ data: null, error: { message: 'transaction failed' } });
  await assert.rejects(
    saveMatchRecordAtomic(client, '00000000-0000-0000-0000-000000000003', record),
    /transaction failed/,
  );
  assert.equal(client.calls.filter(call => call.method === 'rpc').length, 1);
});

test('atomic save refuses to overwrite multiple existing tickets', async () => {
  const client = mockClient(
    { data: { ok: true, match_id: record.id, watch_record_id: '00000000-0000-0000-0000-000000000002' } },
    { ticketIds: ['ticket-1', 'ticket-2'] },
  );
  await assert.rejects(
    saveMatchRecordAtomic(client, '00000000-0000-0000-0000-000000000003', record),
    /複数チケットがあるため/,
  );
  assert.equal(client.calls.length, 0);
});

test('ticket payload includes all mutable ticket fields', async () => {
  const client = mockClient({
    data: { ok: true, match_id: record.id, watch_record_id: '00000000-0000-0000-0000-000000000002' },
  });
  const ticketRecord: MatchRecord = {
    ...record,
    ticketInfo: {
      ...record.ticketInfo,
      id: '00000000-0000-0000-0000-000000000010',
      seatTypeName: '内野',
      seatArea: 'A',
      seatRow: '10',
      seatNumber: '12',
    },
    tickets: [{
      status: 'purchased' as const,
      quantity: 1,
    }],
  };
  ticketRecord.tickets = [ticketRecord.ticketInfo];
  await saveMatchRecordAtomic(client, '00000000-0000-0000-0000-000000000003', ticketRecord);
  const payload = JSON.parse(client.calls[0].table) as Record<string, any>;
  assert.equal(payload.ticket.id, ticketRecord.ticketInfo.id);
  assert.equal(payload.ticket.seat_type_name, '内野');
  assert.equal(payload.ticket.seat_area, 'A');
  assert.equal(payload.ticket.seat_row, '10');
  assert.equal(payload.ticket.seat_number, '12');
});

test('ticket deletion requires an ID and uses an explicit operation', async () => {
  const client = mockClient({
    data: { ok: true, match_id: record.id, watch_record_id: '00000000-0000-0000-0000-000000000002' },
  });
  const ticketRecord: MatchRecord = {
    ...record,
    ticketInfo: { ...record.ticketInfo, id: '00000000-0000-0000-0000-000000000010' },
  };
  ticketRecord.tickets = [ticketRecord.ticketInfo];
  await saveMatchRecordAtomic(
    client,
    '00000000-0000-0000-0000-000000000003',
    ticketRecord,
    { ticketOperation: 'delete' },
  );
  const payload = JSON.parse(client.calls[0].table) as Record<string, any>;
  assert.equal(payload.ticket_operation, 'delete');
  assert.deepEqual(payload.ticket, { id: ticketRecord.ticketInfo.id, status: ticketRecord.ticketInfo.status, release_date: null, purchase_date: null, issue_date: null, payment_deadline: null, quantity: 1, seat_type_name: null, seat_area: null, seat_row: null, seat_number: null, ticket_type: null, vendor: 'Vendor', notes: null });
});

test('ticket deletion without an ID is rejected before the RPC call', async () => {
  const client = mockClient({
    data: { ok: true, match_id: record.id, watch_record_id: '00000000-0000-0000-0000-000000000002' },
  });
  await assert.rejects(
    saveMatchRecordAtomic(client, '00000000-0000-0000-0000-000000000003', record, { ticketOperation: 'delete' }),
    /チケット削除には対象チケットIDが必要です/,
  );
  assert.equal(client.calls.length, 0);
});

import { editRecordTicket, normalizeRecordTickets, normalizeStoredRecords } from './src/utils/ticketRecords';
import { isAtomicSaveEnabled, saveMatchRecord } from './src/lib/supabaseRecords';
import { INITIAL_SEED_RECORDS } from './src/data/seedData';


test('zero tickets derive only the documented compatibility placeholder', () => {
  const value = normalizeRecordTickets({ ...record, tickets: [] });
  assert.deepEqual(value.ticketInfo, { status: 'release_waiting' });
  assert.deepEqual(value.tickets, []);
});
test('legacy records without tickets migrate meaningful ticketInfo', () => {
  const { tickets, ...legacy } = record;
  assert.deepEqual(normalizeRecordTickets(legacy).tickets, [record.ticketInfo]);
});
test('legacy placeholder does not create a fictitious ticket', () => {
  assert.deepEqual(normalizeRecordTickets({ ticketInfo: { status: 'release_waiting' } }).tickets, []);
});
test('canonical tickets override stale compatibility data', () => {
  const value = normalizeRecordTickets({ ...record, ticketInfo: { status: 'purchased' } });
  assert.deepEqual(value.ticketInfo, record.tickets[0]);
});
test('single ticket form edit synchronizes both views and keeps hidden fields', () => {
  const value = editRecordTicket(record, { notes: 'edited' });
  assert.deepEqual(value.ticketInfo, value.tickets[0]);
  assert.equal(value.ticketInfo.vendor, 'Vendor');
});
test('zero to one ticket form edit synchronizes canonical array', () => {
  const value = editRecordTicket({ ...record, tickets: [] }, { status: 'purchased' });
  assert.equal(value.tickets.length, 1);
  assert.deepEqual(value.ticketInfo, value.tickets[0]);
});
test('form edit retains UUID and database concurrency timestamp', () => {
  const ticket = { ...record.ticketInfo, id: '00000000-0000-0000-0000-000000000010' };
  const value = editRecordTicket({ ...record, tickets: [ticket] }, { notes: 'changed' });
  assert.equal(value.tickets[0].id, ticket.id);
  assert.equal(value.updatedAt, record.updatedAt);
});
test('unchanged form keeps empty tickets empty', () => {
  assert.deepEqual(editRecordTicket({ ...record, tickets: [] }, { status: 'release_waiting' }).tickets, []);
});
test('normalization preserves all tickets and form refuses multiple tickets', () => {
  const value = normalizeRecordTickets({ ...record, tickets: [record.ticketInfo, { status: 'purchased' }] });
  assert.equal(value.tickets.length, 2);
  assert.throws(() => editRecordTicket(value, {}), /複数/);
});
test('invalid arrays and invalid IDs are rejected at loading boundary', () => {
  for (const tickets of [null, {}, [{ status: 'ticketed', id: 'invalid' }], [null]]) {
    assert.throws(() => normalizeStoredRecords([{ ...record, tickets }]));
  }
});
test('small stored datasets are normalized without replacing records', () => {
  assert.equal(normalizeStoredRecords([record])[0].id, record.id);
  assert.deepEqual(normalizeStoredRecords([]), []);
});
test('all seed records have derived compatibility values', () => {
  for (const value of INITIAL_SEED_RECORDS) assert.deepEqual(value.ticketInfo, value.tickets[0] || { status: 'release_waiting' });
});
test('both saving routes reject multiple canonical tickets before writes', async () => {
  const client = mockClient({ data: {} });
  const value = { ...record, tickets: [record.ticketInfo, record.ticketInfo] };
  await assert.rejects(saveMatchRecord(client, 'owner', value, false), /複数/);
  await assert.rejects(saveMatchRecordAtomic(client, 'owner', value), /複数/);
  assert.equal(client.calls.length, 0);
});
test('failed save preserves input and concurrency timestamp', async () => {
  const value = editRecordTicket(record, { notes: 'unsaved input' });
  const before = structuredClone(value);
  await assert.rejects(saveMatchRecordAtomic(mockClient({ error: { message: 'failed' } }), 'owner', value));
  assert.deepEqual(value, before);
});
test('Atomic Save remains disabled by default', () => {
  assert.equal(isAtomicSaveEnabled, false);
});

import * as XLSX from 'xlsx';
import { parseExcelFile } from './src/utils/excelUtils';
test('Excel import normalizes explicit tickets and avoids inferred phantom tickets', async () => {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet([
    { '日付': '2026-11-06', 'チケット状態': 'ticketed' },
    { '日付': '2026-11-07', 'チケット状態': '' },
  ]), '記録');
  const bytes = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' });
  const result = await parseExcelFile({ arrayBuffer: async () => bytes } as File);
  assert.equal(result.records.length, 2);
  assert.deepEqual(result.records[0].tickets, [result.records[0].ticketInfo]);
  assert.equal(result.records[0].tickets[0].status, 'ticketed');
  assert.deepEqual(result.records[1].tickets, []);
});

test('zero-ticket RPC payload does not request ticket replacement', async () => {
  const client = mockClient({ data: { ok: true, match_id: record.id, watch_record_id: 'watch' } });
  await saveMatchRecordAtomic(client, 'owner', { ...record, tickets: [] });
  const payload = JSON.parse(client.calls[0].table);
  assert.equal(payload.replace.ticket, false);
});

test('RPC conflict keeps edited input and database timestamp unchanged', async () => {
  const value = editRecordTicket(record, { notes: 'keep input' });
  const client = mockClient({ error: { code: 'PT409', message: 'conflict' } } as any);
  await assert.rejects(saveMatchRecordAtomic(client, 'owner', value), /別の画面で更新/);
  assert.equal(value.ticketInfo.notes, 'keep input');
  assert.equal(value.updatedAt, record.updatedAt);
  assert.equal(client.calls.length, 1);
});

test('RPC success followed by timestamp read failure is committed and blocks resaving', async () => {
  const value = { ...record, id: '00000000-0000-0000-0000-000000000099' };
  const client = mockClient({ data: { ok: true, match_id: value.id, watch_record_id: 'watch' } });
  const original = client.from.bind(client);
  client.from = ((table: string) => table === 'matches' ? {
    select: () => ({ eq: () => ({ single: async () => ({ error: { message: 'offline' }, data: null }) }) }),
  } : original(table)) as typeof client.from;
  const result = await saveMatchRecordAtomic(client, 'owner', value);
  assert.equal(result.refreshRequired, true);
  assert.equal(result.updated_at, record.updatedAt);
  await assert.rejects(saveMatchRecordAtomic(client, 'owner', value), /前回の保存は成功/);
  assert.equal(client.calls.length, 1);
});

function restClient() {
  const writes: Array<{ table: string; operation: string; payload: any }> = [];
  const ticketId = '00000000-0000-0000-0000-000000000010';
  const client = {
    from(table: string) {
      const query: any = {
        data: table === 'tickets' ? [{ id: ticketId }] : null,
        error: null,
        select() { return query; }, eq() { return query; },
        single: async () => ({ data: table === 'matches' ? { updated_at: '2026-11-06T01:00:00.123456Z' } : { id: 'watch' }, error: null }),
        maybeSingle: async () => ({ data: { id: ticketId }, error: null }),
      };
      for (const operation of ['upsert', 'insert', 'update', 'delete']) {
        query[operation] = (payload: any) => {
          writes.push({ table, operation, payload });
          return query;
        };
      }
      return query;
    },
  } as unknown as SupabaseClient;
  return { client, writes, ticketId };
}
test('disabled Atomic route retains REST compatibility, ticket UUID and DB time', async () => {
  const { client, writes, ticketId } = restClient();
  const value = editRecordTicket({ ...record, tickets: [{ ...record.ticketInfo, id: ticketId }] }, { notes: 'REST edit' });
  const result = await saveMatchRecord(client, 'owner', value, false);
  assert.equal(result.updated_at, '2026-11-06T01:00:00.123456Z');
  assert.equal(writes.find(write => write.table === 'tickets')?.operation, 'update');
  assert.equal(writes.find(write => write.table === 'tickets')?.payload.notes, 'REST edit');
  assert.equal(value.ticketInfo.id, ticketId);
});
