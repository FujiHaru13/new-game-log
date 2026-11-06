import assert from 'node:assert/strict';
import test from 'node:test';
import { saveMatchRecordAtomic } from './src/lib/supabaseRecords';
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
