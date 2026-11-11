import assert from 'node:assert/strict';
import test from 'node:test';
import { beginPendingSave, readPendingSave } from './src/lib/atomic/pendingSaveGuard';
import { reviewPendingSaveReadOnly } from './src/lib/atomic/pendingSaveReview';

const owner='11111111-1111-4111-8111-111111111111';
const match='22222222-2222-4222-8222-222222222222';
class MemoryStorage implements Storage {
  private rows=new Map<string,string>();
  get length() { return this.rows.size; }
  clear() { this.rows.clear(); }
  getItem(k:string) { return this.rows.get(k) ?? null; }
  key(n:number) { return [...this.rows.keys()][n] ?? null; }
  removeItem(k:string) { this.rows.delete(k); }
  setItem(k:string,v:string) { this.rows.set(k,v); }
}
const snapshot = {revision:'42',updatedAt:'2026-11-11T11:00:00.123456+09:00'};
const client = {} as Parameters<typeof reviewPendingSaveReadOnly>[0];
const fetchOk = (async () => ({snapshot})) as unknown as NonNullable<Parameters<typeof reviewPendingSaveReadOnly>[4]>;

test('read-only inspection never releases a pending marker or claims success',async()=>{
  const storage=new MemoryStorage(); const marker=beginPendingSave(owner,match,'full_form',storage);
  const result=await reviewPendingSaveReadOnly(client,owner,match,storage,fetchOk);
  assert.equal(result.status,'observed_unproven');
  assert.match(result.message,/証拠にはなりません/);
  assert.equal(readPendingSave(owner,match,storage)?.attemptId,marker.attemptId);
  assert.equal(storage.length,1);
});
test('unavailable snapshot keeps marker and conceals raw network error',async()=>{
  const storage=new MemoryStorage(); beginPendingSave(owner,match,'ticket',storage);
  const bad=(async()=>{throw new Error('sensitive transport details');}) as unknown as NonNullable<Parameters<typeof reviewPendingSaveReadOnly>[4]>;
  const result=await reviewPendingSaveReadOnly(client,owner,match,storage,bad);
  assert.equal(result.status,'unavailable'); assert.doesNotMatch(result.message,/sensitive/);
  assert.equal(storage.length,1);
});
test('missing marker never triggers network read',async()=>{
  const storage=new MemoryStorage();let called=false;
  const fetch=(async()=>{called=true;return {snapshot};}) as unknown as NonNullable<Parameters<typeof reviewPendingSaveReadOnly>[4]>;
  const result=await reviewPendingSaveReadOnly(client,owner,match,storage,fetch);
  assert.equal(result.status,'none');assert.equal(called,false);
});
test('changed marker while reading gives unavailable, not false confirmation',async()=>{
  const storage=new MemoryStorage(); beginPendingSave(owner,match,'full_form',storage);
  const fetch=(async()=>{storage.clear();return {snapshot};}) as unknown as NonNullable<Parameters<typeof reviewPendingSaveReadOnly>[4]>;
  const result=await reviewPendingSaveReadOnly(client,owner,match,storage,fetch);
  assert.equal(result.status,'unavailable');
});
test('corrupt browser marker fails closed without network call',async()=>{
  const storage=new MemoryStorage();beginPendingSave(owner,match,'ticket',storage);
  storage.setItem(storage.key(0)!,'{broken');let called=false;
  const fetch=(async()=>{called=true;return {snapshot};}) as unknown as NonNullable<Parameters<typeof reviewPendingSaveReadOnly>[4]>;
  const result=await reviewPendingSaveReadOnly(client,owner,match,storage,fetch);
  assert.equal(result.status,'unavailable');assert.equal(called,false);
});
