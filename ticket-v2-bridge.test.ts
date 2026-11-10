import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beginTicketEditor, addTicketRow } from './src/lib/atomic/ticketEditorDraft';
import { assertFreshTicketEditor, isV2TicketWriteEnabled, createTicketOnlySaveController } from './src/lib/atomic/ticketSaveBridge';
import type { MatchRecord } from './src/types/baseball';
import type { MatchSnapshot } from './src/lib/atomic/snapshot';
import type { SupabaseClient } from '@supabase/supabase-js';

const id='11111111-1111-4111-8111-111111111111';
const tid='22222222-2222-4222-8222-222222222222';
const time='2026-11-10T04:00:00.123456+00:00';
const original={id,updatedAt:time,tickets:[{id:tid,status:'ticketed' as const,quantity:1}]} as MatchRecord;
const snapshot={record:{...original}, updatedAt:time} as MatchSnapshot;

test('R2-B2 v2 writes remain disabled without both explicit opt-ins', async () => {
  assert.equal(isV2TicketWriteEnabled(), false);
  let network=0;
  const client={rpc(){network++;throw Error('unexpected network')}, auth:{getSession(){network++;throw Error('unexpected network')}}} as unknown as SupabaseClient;
  await assert.rejects(createTicketOnlySaveController(client,id,original,addTicketRow(beginTicketEditor(original.tickets))),/未有効化/);
  assert.equal(network,0);
});

test('R2-B2 detects outdated parent timestamps before any save', () => {
  const edited=addTicketRow(beginTicketEditor(original.tickets));
  const stale={...snapshot,updatedAt:'2026-11-10T04:00:00.123457+00:00'} as MatchSnapshot;
  assert.throws(()=>assertFreshTicketEditor(original,edited,stale),/別の端末/);
});

test('R2-B2 detects changed ticket and changed IDs', () => {
  const edited=addTicketRow(beginTicketEditor(original.tickets));
  const changed={...snapshot,record:{...original,tickets:[{...original.tickets[0],quantity:2}]}} as MatchSnapshot;
  assert.throws(()=>assertFreshTicketEditor(original,edited,changed),/別の端末/);
  const mismatched={...snapshot,record:{...original,id:tid}} as MatchSnapshot;
  assert.throws(()=>assertFreshTicketEditor(original,edited,mismatched),/別の試合/);
});

test('R2-B2 allows matching baseline only when ticket changes exist', () => {
  const draft=beginTicketEditor(original.tickets);
  assert.throws(()=>assertFreshTicketEditor(original,draft,snapshot),/変更がありません/);
  assert.doesNotThrow(()=>assertFreshTicketEditor(original,addTicketRow(draft),snapshot));
});
