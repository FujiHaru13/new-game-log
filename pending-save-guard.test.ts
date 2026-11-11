import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertNoPendingSave, beginPendingSave, clearConfirmedPendingSave,
  markPendingSave, readPendingSave,
} from './src/lib/atomic/pendingSaveGuard';

const owner='11111111-1111-4111-8111-111111111111';
const match='22222222-2222-4222-8222-222222222222';
class MemoryStorage implements Storage {
  private data = new Map<string,string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key:string) { return this.data.get(key) ?? null; }
  key(index:number) { return [...this.data.keys()][index] ?? null; }
  removeItem(key:string) { this.data.delete(key); }
  setItem(key:string,value:string) { this.data.set(key,value); }
}

test('pending marker survives simulated page reload and blocks all second attempts', () => {
  const storage=new MemoryStorage();
  const pending=beginPendingSave(owner,match,'full_form',storage);
  assert.equal(pending.phase,'attempting');
  assert.equal(readPendingSave(owner,match,storage)?.attemptId,pending.attemptId);
  assert.throws(()=>assertNoPendingSave(owner,match,storage),/確認待ち/);
  assert.throws(()=>beginPendingSave(owner,match,'ticket',storage),/確認待ち/);
  markPendingSave(pending,'partial_or_unknown',storage);
  assert.equal(readPendingSave(owner,match,storage)?.phase,'partial_or_unknown');
  assert.throws(()=>assertNoPendingSave(owner,match,storage),/確認待ち/);
  assert.doesNotMatch(JSON.stringify(readPendingSave(owner,match,storage)),/purchase|ticketInfo|notes|amount/);
});
test('sync failure remains blocked; only explicit confirmed completion can clear marker', () => {
  const storage=new MemoryStorage();
  const pending=beginPendingSave(owner,match,'ticket',storage);
  markPendingSave(pending,'saved_sync_failed',storage);
  assert.throws(()=>assertNoPendingSave(owner,match,storage),/確認待ち/);
  clearConfirmedPendingSave(pending,storage);
  assert.equal(readPendingSave(owner,match,storage),null);
  assert.doesNotThrow(()=>assertNoPendingSave(owner,match,storage));
});
test('different owner and match never share a marker', () => {
  const storage=new MemoryStorage();
  beginPendingSave(owner,match,'ticket',storage);
  assert.equal(readPendingSave('33333333-3333-4333-8333-333333333333',match,storage),null);
  assert.equal(readPendingSave(owner,'44444444-4444-4444-8444-444444444444',storage),null);
});
test('corrupt marker and blocked storage fail closed', () => {
  const storage=new MemoryStorage();
  beginPendingSave(owner,match,'ticket',storage);
  const key=storage.key(0)!;
  storage.setItem(key,'{invalid json');
  assert.throws(()=>assertNoPendingSave(owner,match,storage),/読み取れません/);
  const denied = new MemoryStorage();
  denied.setItem=()=>{ throw new Error('quota/security restriction'); };
  assert.throws(()=>beginPendingSave(owner,match,'full_form',denied),/送信を停止/);
});
test('mismatched attempts cannot release outstanding marker', () => {
  const storage=new MemoryStorage();
  const pending=beginPendingSave(owner,match,'ticket',storage);
  const fake={...pending,attemptId:'55555555-5555-4555-8555-555555555555'};
  assert.throws(()=>clearConfirmedPendingSave(fake,storage),/一致しない/);
  assert.equal(readPendingSave(owner,match,storage)?.attemptId,pending.attemptId);
});
