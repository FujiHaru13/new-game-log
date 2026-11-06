import assert from 'node:assert/strict';
import test from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sql, verifyTarget, literal, json, owner, match } from './harness.mjs';
import { createV2SaveController, verifyV2Capability } from '../../../src/lib/atomic/adapter';
import { createNewMatchDraft } from '../../../src/lib/atomic/payload';
import { createTicketDraft } from '../../../src/lib/atomic/tickets';

console.log(JSON.stringify(verifyTarget()));
const role=`set local role authenticated; set local request.jwt.claim.sub='${owner}'; set local statement_timeout='6s';`;
const created='12000000-0000-0000-0000-000000000001';
function sqlClient() {
  const calls:string[]=[];
  const client={
    auth:{getSession:async()=>({data:{session:{user:{id:owner}}},error:null})},
    from(){throw new Error('REST is forbidden');},
    async rpc(name:string,args:Record<string,unknown>) {
      calls.push(name);
      if (!['save_match_record','get_match_record_snapshot'].includes(name)) throw new Error('Unexpected RPC');
      const expression=name==='save_match_record' ? `public.save_match_record(${json(args.p_payload)})` : `public.get_match_record_snapshot(${literal(String(args.p_match_id))}::uuid)`;
      try { return {data:JSON.parse(sql(`begin; ${role} select ${expression}; commit;`)),error:null,status:200}; }
      catch(error) {
        const message=String((error as {stderr?:unknown}).stderr);
        return {data:null,error:{code:message.includes('match revision was modified') || message.includes('match was modified') ? 'PT409':'23514',message},status:400};
      }
    },
  } as unknown as SupabaseClient;
  return {client,calls};
}

test('R2-A real SQL: v2 create and multi-ticket edit synchronize UUIDs, versions and retained details',async()=>{
  const {client,calls}=sqlClient();
  const {capability,snapshot:base}=await verifyV2Capability(client,{contract:'atomic_v2',ownerId:owner,probeMatchId:match});
  const record=createNewMatchDraft({...base.record,matchStatus:'scheduled'},created);
  try {
    const first=await createV2SaveController(client,capability,{contract:'atomic_v2',record,baseline:null,
      tickets:[createTicketDraft({status:'purchased',vendor:'first'},'one'),createTicketDraft({status:'ticketed',quantity:2},'two')]}).save();
    assert.equal(first.phase,'completed',JSON.stringify(first.issue));
    assert.equal(first.snapshot!.record.tickets.length,2);
    assert.equal(first.receipt!.created_tickets.length,2);
    assert.ok(first.snapshot!.record.tickets.every(t=>t.id));
    const a=first.receipt!.created_tickets.find(t=>t.client_key==='one')!.id;
    const b=first.receipt!.created_tickets.find(t=>t.client_key==='two')!.id;
    sql(`begin; ${role} insert into public.match_links(match_id,title,url) values('${created}','keep','https://example.test'); commit;`);
    // Refresh the basis after the separate direct write, without inventing a saved revision.
    const refreshed=await verifyV2Capability(client,{contract:'atomic_v2',ownerId:owner,probeMatchId:created});
    const next=await createV2SaveController(client,refreshed.capability,{contract:'atomic_v2',record:{...refreshed.snapshot.record,notes:'second'},baseline:refreshed.snapshot,
      tickets:[{id:a,vendor:null},createTicketDraft({status:'purchased'},'three')],deletedTicketIds:[b]}).save();
    assert.equal(next.phase,'completed',JSON.stringify(next.issue));
    assert.equal(next.snapshot!.record.tickets.length,2);
    assert.equal(next.snapshot!.record.tickets.find(t=>t.id===a)!.vendor,undefined);
    assert.equal(next.snapshot!.raw.links.length,1);
    assert.ok(BigInt(next.snapshot!.revision)>BigInt(first.snapshot!.revision));
    assert.equal(next.snapshot!.record.updatedAt,next.snapshot!.updatedAt);
    assert.equal(calls.filter(name=>name==='save_match_record').length,2);
  } finally {
    sql(`begin; ${role} delete from public.matches where id='${created}' and owner_id='${owner}'; commit;`);
  }
});

test('R2-A real SQL: stale basis produces PT409 and input stays intact',async()=>{
  const {client,calls}=sqlClient();
  const verified=await verifyV2Capability(client,{contract:'atomic_v2',ownerId:owner,probeMatchId:match});
  sql(`begin; ${role} update public.tickets set notes='R2-A concurrent edit' where match_id='${match}'; commit;`);
  const controller=createV2SaveController(client,verified.capability,{contract:'atomic_v2',record:{...verified.snapshot.record,notes:'unsaved form'},baseline:verified.snapshot,tickets:verified.snapshot.record.tickets});
  const state=await controller.save();
  assert.equal(state.phase,'conflict'); assert.equal(state.request.input.record.notes,'unsaved form');
  assert.equal(state.request.input.baseline!.revision,verified.snapshot.revision);
  assert.equal(calls.filter(name=>name==='save_match_record').length,1);
  sql(`begin; ${role} update public.tickets set notes=null where match_id='${match}'; commit;`);
  assert.equal(sql(`select count(*) from public.matches where id='${created}';`),'0');
  assert.equal(sql('select count(*) from public.payments;'),'0');
});
