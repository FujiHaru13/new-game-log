import assert from 'node:assert/strict';
import test from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { MatchRecord } from './src/types/baseball';
import { deleteMatchRecord, saveMatchRecord } from './src/lib/supabaseRecords';

const owner = '00000000-0000-0000-0000-000000000001';
const record: MatchRecord = {
  id: '10000000-0000-0000-0000-000000000001',
  date: '2026-11-06', isDateUnknown: false,
  homeTeamId: 'dragons', awayTeamId: 'giants', stadiumId: '',
  matchType: 'official', matchStatus: 'scheduled', homeScore: null, awayScore: null,
  isScoreConfirmed: false, watchStatus: 'scheduled', cheerTeamId: 'dragons',
  categories: [], primaryCategory: 'other', seatInfo: {}, costInfo: { splits: [] },
  tickets: [], ticketInfo: { status: 'release_waiting' },
  createdAt: '2026-11-06T00:00:00Z', updatedAt: '2026-11-06T00:00:00Z',
};

function clientWithProtectedDelete() {
  const calls: Array<{ table: string; operation: string; filters?: Array<[string,string]> }> = [];
  const client = {
    from(table: string) {
      return {
        select() { return { eq: () => ({ data: [], error: null }) }; },
        upsert() {
          calls.push({ table, operation: 'upsert' });
          if (table === 'matches') return { select: () => ({ single: async () => ({ data: { updated_at: record.updatedAt }, error: null }) }) };
          return { error: { message: 'synthetic watch save failure' } };
        },
        delete() {
          const filters: Array<[string,string]> = [];
          calls.push({ table, operation: 'delete', filters });
          const result = {
            error: { code: '23503', message: 'match has related payments; deletion is forbidden' },
            eq(key: string, value: string) { filters.push([key,value]); return result; },
          };
          return result;
        },
      };
    },
    rpc() { throw new Error('unexpected RPC or fallback'); },
  } as unknown as SupabaseClient;
  return { client, calls };
}

test('R1 protected match DELETE rejects through the existing application DAO', async () => {
  const { client, calls } = clientWithProtectedDelete();
  await assert.rejects(deleteMatchRecord(client, owner, record.id), /試合の削除に失敗.*related payments/);
  assert.deepEqual(calls, [{ table: 'matches', operation: 'delete', filters: [['id',record.id],['owner_id',owner]] }]);
});

test('R1 rejected new REST compensation reports retained match ID and performs exactly one cleanup', async () => {
  const { client, calls } = clientWithProtectedDelete();
  await assert.rejects(saveMatchRecord(client, owner, record, true), error => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /synthetic watch save failure/);
    assert.match(error.message, /自動ロールバックにも失敗/);
    assert.ok(error.message.includes(record.id));
    assert.match(error.message, /手動回復/);
    return true;
  });
  assert.deepEqual(calls, [
    { table: 'matches', operation: 'upsert' },
    { table: 'watch_records', operation: 'upsert' },
    { table: 'matches', operation: 'delete', filters: [['id',record.id],['owner_id',owner]] },
  ]);
});

test('R1 failed existing REST save never compensates by deleting an existing match or payment', async () => {
  const { client, calls } = clientWithProtectedDelete();
  await assert.rejects(saveMatchRecord(client, owner, record, false), /synthetic watch save failure/);
  assert.deepEqual(calls, [{ table: 'matches', operation: 'upsert' }, { table: 'watch_records', operation: 'upsert' }]);
});
