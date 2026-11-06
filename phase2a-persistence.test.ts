import assert from 'node:assert/strict';
import test from 'node:test';
import { isAtomicSaveConflict, saveMatchRecordAtomic } from './src/lib/supabaseRecords';
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
  createdAt: '2026-11-06T00:00:00Z',
  updatedAt: '2026-11-06T00:00:00Z',
};

test('atomic save recognizes PT409 and HTTP 409 conflicts', () => {
  assert.equal(isAtomicSaveConflict({ code: 'PT409' }), true);
  assert.equal(isAtomicSaveConflict({ status: 409 }), true);
  assert.equal(isAtomicSaveConflict({ code: 'PGRST', message: 'Conflict' }), false);
});

function mockClient(rpcResult: { data?: unknown; error?: { message: string } }): SupabaseClient & {
  calls: Array<{ table: string; method: string }>;
} {
  const calls: Array<{ table: string; method: string }> = [];
  return {
    calls,
    from(table: string) {
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => ({ data: null, error: null }),
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

test('ticket payload includes all mutable ticket fields', async () => {
  const client = mockClient({
    data: { ok: true, match_id: record.id, watch_record_id: '00000000-0000-0000-0000-000000000002' },
  });
  const ticketRecord = {
    ...record,
    ticketInfo: {
      ...record.ticketInfo,
      id: '00000000-0000-0000-0000-000000000010',
      seatTypeName: '内野',
      seatArea: 'A',
      seatRow: '10',
      seatNumber: '12',
    },
  };
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
  const ticketRecord = {
    ...record,
    ticketInfo: { ...record.ticketInfo, id: '00000000-0000-0000-0000-000000000010' },
  };
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
