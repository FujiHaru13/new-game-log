import assert from 'node:assert/strict';
import test from 'node:test';
import type { SupabaseClient } from '@supabase/supabase-js';
import { buildTicketChanges, createTicketDraft, type TicketEdit } from './src/lib/atomic/tickets';
import { acceptSnapshot, parseMatchSnapshot } from './src/lib/atomic/snapshot';
import { createNewMatchDraft, prepareV2Save, type V2SaveDraft } from './src/lib/atomic/payload';
import { createV2SaveController, verifyV2Capability, CapabilityError, type V2Capability } from './src/lib/atomic/adapter';
import { saveMatchRecord, saveMatchRecordAtomic } from './src/lib/supabaseRecords';
import { snapshot, ticketRow, owner, matchId, watchId, ticketA, ticketB, ticketC, otherId, stamp, later } from './tests/fixtures/atomicSnapshot';

const base=()=>parseMatchSnapshot(snapshot(),{ownerId:owner,matchId});
const draft=():V2SaveDraft=>structuredClone({contract:'atomic_v2',record:base().record,baseline:base(),tickets:base().record.tickets});
const receipt=()=>({ok:true,match_id:matchId,watch_record_id:watchId,updated_at:later,revision:'6',created_tickets:[]});
type Response={data?:unknown;error?:unknown;status?:number};
function mock(options:{read?:Array<Response|Error>;write?:Response|Error;writePromise?:Promise<Response>}={}) {
  const calls:Array<{name:string;args:any}>=[], reads=[...(options.read || [])];
  const client={
    auth:{getSession:async()=>({data:{session:{user:{id:owner}}},error:null})},
    from() { throw new Error('REST fallback/write forbidden'); },
    async rpc(name:string,args:unknown) {
      calls.push({name,args});
      const result=name==='get_match_record_snapshot' ? reads.shift() || {data:snapshot('6',later)} : options.writePromise ? await options.writePromise : options.write || {data:receipt()};
      if (result instanceof Error) throw result;
      return result;
    },
  } as unknown as SupabaseClient;
  return {client,calls};
}
async function ready(options:Parameters<typeof mock>[0]={}) {
  const fixture=mock({...options,read:[{data:snapshot()},...(options.read || [])]});
  const verified=await verifyV2Capability(fixture.client,{contract:'atomic_v2',ownerId:owner,probeMatchId:matchId});
  return {...fixture,...verified};
}
const writes=(calls:ReturnType<typeof mock>['calls'])=>calls.filter(call=>call.name==='save_match_record');

test('ticket diff: zero, unchanged single and unchanged multiple produce no operations',()=>{
  const t=base().record.tickets[0];
  for (const tickets of [[],[t],[t,{...t,id:ticketB}]]) assert.deepEqual(buildTicketChanges(tickets,tickets),{create:[],update:[],delete:[]});
});
test('ticket diff: mixed create/update/delete and retained omitted ticket',()=>{
  const t=base().record.tickets[0];
  const diff=buildTicketChanges([t,{...t,id:ticketB},{...t,id:ticketC}],[{id:ticketA,notes:'edited'},createTicketDraft({status:'ticketed'},'new')],[ticketB]);
  assert.deepEqual(diff,{create:[{client_key:'new',values:{status:'ticketed'}}],update:[{id:ticketA,changes:{notes:'edited'}}],delete:[ticketB]});
});
test('ticket diff: missing and undefined retain fields; explicit null clears',()=>{
  const t=base().record.tickets[0];
  assert.deepEqual(buildTicketChanges([t],[{id:ticketA,vendor:undefined}]).update,[]);
  assert.deepEqual(buildTicketChanges([t],[{id:ticketA,vendor:null}]).update,[{id:ticketA,changes:{vendor:null}}]);
});
test('ticket diff: cancelling an unsaved row never emits delete; default-only intentional create is retained',()=>{
  assert.deepEqual(buildTicketChanges([],[]).delete,[]);
  assert.deepEqual(buildTicketChanges([],[createTicketDraft({},'new')]).create,[{client_key:'new',values:{}}]);
});
test('ticket diff: rejects duplicate UUIDs including case, client keys and overlapping deletes',()=>{
  const t=base().record.tickets[0];
  for (const run of [
    ()=>buildTicketChanges([t,t],[]),()=>buildTicketChanges([t],[{id:ticketA},{id:ticketA}]),
    ()=>buildTicketChanges([],[createTicketDraft({},'same'),createTicketDraft({},'same')]),
    ()=>buildTicketChanges([t],[{id:ticketA}],[ticketA]),()=>buildTicketChanges([t],[],[ticketA,ticketA]),
    ()=>buildTicketChanges([t],[{id:ticketB}]),()=>buildTicketChanges([t],[],[ticketB]),
    ()=>buildTicketChanges([],[{status:'purchased'}]),
  ]) assert.throws(run);
});
test('ticket diff: invalid dates, types, IDs, quantities and immutable fields fail locally',()=>{
  for (const value of [
    {clientKey:'k',status:'bad'},{clientKey:'k',quantity:0},{clientKey:'k',quantity:1.5},{clientKey:'k',quantity:2147483648},
    {clientKey:'k',purchaseDate:'2026-02-30'},{clientKey:'k',quantity:'1'},{clientKey:'k',status:null},{clientKey:'k',vendor:{}},
    {clientKey:'k',purchaseAmount:NaN},{clientKey:'k',id:'bad'},{clientKey:'k',owner_id:owner},
  ]) assert.throws(()=>buildTicketChanges([],[value as TicketEdit]));
});
test('ticket diff: purchase/refund fields and existing UUID are preserved',()=>{
  const t=base().record.tickets[0];
  assert.deepEqual(buildTicketChanges([t],[{...t,refundAmount:100,refundStatus:'pending'}]).update,[{id:ticketA,changes:{refund_amount:100,refund_status:'pending'}}]);
  assert.equal(createTicketDraft({},'fixed').clientKey,'fixed');
});
test('v2 payload: explicit version/revision and canonical tickets, stale ticketInfo ignored',()=>{
  const value=draft(); value.record={...value.record,ticketInfo:{status:'ticketed'},notes:'new'};
  const result=prepareV2Save(value,owner);
  assert.equal(result.payload.contract_version,2);
  assert.equal((result.payload.match as any).expected_revision,'5');
  assert.equal((result.payload.match as any).expected_updated_at,stamp);
  assert.deepEqual(result.ticketChanges,{create:[],update:[],delete:[]});
  assert.equal((result.payload.match as any).notes,'new');
  for (const key of ['ticket','ticket_operation','owner_id']) assert.equal(key in result.payload,false);
});
test('v2 payload: unchanged details are not replaced, even if incomplete draft arrays are empty',()=>{
  const value=draft(); value.record={...value.record,homeRuns:[],links:[],costInfo:{...value.record.costInfo,splits:[]}};
  const result=prepareV2Save(value,owner);
  assert.equal('replace' in result.payload,false);
  for (const key of ['innings','pitchers','links','splits','categories','seat','home_runs']) assert.equal(key in result.payload,false);
});
test('v2 payload: explicit detail clears use objects and SQL field names, not null objects',()=>{
  const value=draft(); value.changedDetails=['innings','pitchers','splits'];
  value.record={...value.record,innings:undefined,pitchers:undefined,costInfo:{...value.record.costInfo,splits:[{id:'local',title:'part',amount:1,paidDate:'2026-11-06'}]}};
  const result=prepareV2Save(value,owner);
  assert.deepEqual(result.payload.innings,{}); assert.deepEqual(result.payload.pitchers,{});
  assert.deepEqual(result.payload.splits,[{title:'part',amount:1,paid_date:'2026-11-06',memo:null}]);
  assert.deepEqual(result.payload.replace,{innings:true,pitchers:true,splits:true});
});
test('v2 payload: rejects invalid baseline versions and data before a network call',()=>{
  const a=draft(); a.record={...a.record,updatedAt:later}; assert.throws(()=>prepareV2Save(a,owner));
  const b=draft(); b.record={...b.record,homeScore:NaN}; assert.throws(()=>prepareV2Save(b,owner));
  const c=draft(); c.changedDetails=['seat','seat']; assert.throws(()=>prepareV2Save(c,owner));
});
test('new match ID/client_key are allocated before saving and reused by immutable intent',()=>{
  const initial=base().record; const {id:_id,...fields}=initial;
  const record=createNewMatchDraft({...fields,matchStatus:'scheduled'},otherId), ticket=createTicketDraft({status:'purchased'},'fixed-client-key');
  const input:V2SaveDraft={contract:'atomic_v2',record,baseline:null,tickets:[ticket]};
  assert.deepEqual(prepareV2Save(input,owner),prepareV2Save(input,owner));
  assert.equal((prepareV2Save(input,owner).payload.match as any).expected_revision,'0');
  assert.equal('expected_updated_at' in (prepareV2Save(input,owner).payload.match as any),false);
  assert.equal('id' in prepareV2Save(input,owner).ticketChanges.create[0].values,false);
});

test('snapshot: strict restoration of all tickets, DB precision and canonical representative',()=>{
  const raw=snapshot(); raw.tickets=[ticketRow(ticketB),ticketRow(ticketA)];
  const value=parseMatchSnapshot(raw,{ownerId:owner,matchId});
  assert.deepEqual(value.record.tickets.map(ticket=>ticket.id),[ticketA,ticketB]);
  assert.deepEqual(value.record.ticketInfo,value.record.tickets[0]);
  assert.equal(value.record.updatedAt,stamp); assert.equal(value.revision,'5');
  assert.equal(value.record.tickets[0].purchaseAmount,2000);
});
test('snapshot: zero tickets derive compatibility placeholder; all raw details retained',()=>{
  const raw=snapshot(); raw.tickets=[];
  const value=parseMatchSnapshot(raw,{ownerId:owner,matchId});
  assert.deepEqual(value.record.ticketInfo,{status:'release_waiting'});
  assert.deepEqual(value.raw,raw);
});
test('snapshot: huge revision remains a string and microsecond floor is exact',()=>{
  const raw=snapshot('9007199254740993',later);
  const value=parseMatchSnapshot(raw,{ownerId:owner,matchId,floor:{revision:'9007199254740992',updatedAt:stamp}});
  assert.equal(value.revision,'9007199254740993');
  assert.throws(()=>parseMatchSnapshot(snapshot('6',stamp),{ownerId:owner,matchId,floor:{revision:'6',updatedAt:later}}));
});
test('snapshot: missing tables/fields, numeric revision and malformed nulls never become empty data',()=>{
  for (const mutate of [
    (raw:any)=>delete raw.tickets,(raw:any)=>raw.revision=5,(raw:any)=>raw.match.revision='4',
    (raw:any)=>delete raw.tickets[0].vendor,(raw:any)=>raw.tickets=null,(raw:any)=>raw.watch_record=[],
    (raw:any)=>raw.tickets[0].quantity=0,(raw:any)=>raw.updated_at='bad',(raw:any)=>raw.match.source_payload=undefined,
  ]) { const raw=snapshot(); mutate(raw); assert.throws(()=>parseMatchSnapshot(raw,{ownerId:owner,matchId})); }
});
test('snapshot: cross-owner/match/watch rows and duplicate IDs are rejected',()=>{
  for (const mutate of [
    (raw:any)=>raw.match.owner_id=otherId,(raw:any)=>raw.tickets[0].match_id=otherId,
    (raw:any)=>raw.seats[0].watch_record_id=otherId,(raw:any)=>raw.tickets.push(raw.tickets[0]),
    (raw:any)=>raw.seats.push(raw.seats[0]),
  ]) { const raw=snapshot(); mutate(raw); assert.throws(()=>parseMatchSnapshot(raw,{ownerId:owner,matchId})); }
});
test('snapshot: sparse innings keep holes and totals without innings are restored',()=>{
  const raw:any=snapshot(); raw.innings=[{match_id:matchId,inning_number:3,side:'home',runs:0,is_not_played:false}];
  raw.totals=[{match_id:matchId,side:'home',hits:4,errors:0}];
  assert.deepEqual(parseMatchSnapshot(raw,{ownerId:owner,matchId}).record.innings!.home,[null,null,0]);
  raw.innings=[]; assert.equal(parseMatchSnapshot(raw,{ownerId:owner,matchId}).record.innings!.homeHits,4);
});
test('snapshot: DB postponed status is preserved without altering legacy MatchRecord UI',()=>{
  const raw=snapshot(); raw.match.match_status='postponed';
  assert.equal(parseMatchSnapshot(raw,{ownerId:owner,matchId}).record.matchStatus,'postponed');
});
test('snapshot application rejects older revisions and does not mutate current state',()=>{
  const current=parseMatchSnapshot(snapshot('6',later),{ownerId:owner,matchId});
  assert.throws(()=>acceptSnapshot(current,base())); assert.equal(current.revision,'6');
});

test('capability: v2 must be explicitly selected and verified on the same connection',async()=>{
  const m=mock();
  assert.throws(()=>createV2SaveController(m.client,{} as V2Capability,draft()));
  assert.equal(m.calls.length,0);
  const r=await ready(); const other=mock();
  assert.throws(()=>createV2SaveController(other.client,r.capability,draft()));
});
test('capability: missing RPC, auth errors and network failures never downgrade to v1 or REST',async()=>{
  for (const value of [{error:{code:'PGRST202',message:'absent'},status:404},{error:{code:'42501',message:'denied'},status:403},new TypeError('offline')]) {
    const m=mock({read:[value]});
    await assert.rejects(verifyV2Capability(m.client,{contract:'atomic_v2',ownerId:owner,probeMatchId:matchId}),CapabilityError);
    assert.deepEqual(m.calls.map(call=>call.name),['get_match_record_snapshot']);
  }
});
test('legacy REST and v1 reject v2 envelopes/records before any request',async()=>{
  const m=mock();
  for (const record of [base().record,{...base().record,contract_version:2},{contract:'atomic_v2',ticket_changes:{}}]) {
    await assert.rejects(saveMatchRecord(m.client,owner,record as any,false),/v2/);
    await assert.rejects(saveMatchRecordAtomic(m.client,owner,record as any),/v2/);
  }
  assert.equal(m.calls.length,0);
});
test('v2 normal save is exactly one Atomic RPC plus one snapshot and exposes every phase',async()=>{
  const r=await ready(), phases:string[]=[];
  const controller=createV2SaveController(r.client,r.capability,draft(),state=>phases.push(state.phase));
  assert.equal(controller.getState().phase,'idle');
  const result=await controller.save();
  assert.equal(result.phase,'completed'); assert.equal(result.snapshot!.record.updatedAt,later);
  assert.equal(result.snapshot!.revision,'6'); assert.deepEqual(phases,['saving','saved_syncing','completed']);
  assert.equal(writes(r.calls).length,1); assert.equal(writes(r.calls)[0].args.p_payload.contract_version,2);
  await controller.save(); assert.equal(writes(r.calls).length,1);
});
test('PT409 retains immutable draft and baseline; no snapshot or retry after rejection',async()=>{
  const r=await ready({write:{error:{code:'PT409',message:'conflict'},status:409}}), input=draft();
  const before=structuredClone(input), c=createV2SaveController(r.client,r.capability,input);
  input.record.notes='caller mutation';
  const state=await c.save(); assert.equal(state.phase,'conflict'); assert.deepEqual(state.request.input,before);
  await c.save(); assert.equal(writes(r.calls).length,1); assert.equal(r.calls.length,2);
});
test('explicit SQL rejection is rejected; HTTP409 unique constraint is not PT409 conflict',async()=>{
  for (const code of ['23514','23505','42501']) {
    const r=await ready({write:{error:{code,message:'rejected'},status:code==='23505'?409:400}});
    const c=createV2SaveController(r.client,r.capability,draft()); assert.equal((await c.save()).phase,'rejected');
    assert.equal(r.calls.length,2);
  }
});
test('success then sync failure permits only read retry and never re-sends writes',async()=>{
  const r=await ready({read:[new TypeError('read offline'),{data:snapshot('6',later)}]});
  const c=createV2SaveController(r.client,r.capability,draft());
  const failed=await c.save(); assert.equal(failed.phase,'saved_sync_failed'); assert.ok(failed.receipt);
  await c.save(); assert.equal(writes(r.calls).length,1);
  assert.equal((await c.refresh()).phase,'completed'); assert.equal(writes(r.calls).length,1);
});
test('success then stale snapshot is not applied; later read may complete synchronization',async()=>{
  const r=await ready({read:[{data:snapshot()},{data:snapshot('6',later)}]});
  const c=createV2SaveController(r.client,r.capability,draft());
  assert.equal((await c.save()).phase,'saved_sync_failed'); assert.equal(c.getState().snapshot,undefined);
  assert.equal((await c.refresh()).phase,'completed');
});
test('newer snapshot after save is applied as its own generation, not the receipt generation',async()=>{
  const r=await ready({read:[{data:snapshot('9','2026-11-06T00:00:01.123456Z')}]});
  const result=await createV2SaveController(r.client,r.capability,draft()).save();
  assert.equal(result.receipt!.revision,'6'); assert.equal(result.snapshot!.revision,'9');
});
test('network disconnect, 504, connection SQLSTATE and unclassified errors remain unknown',async()=>{
  for (const value of [new TypeError('fetch failed'),{error:{message:'timeout'},status:504},{error:{code:'08006',message:'connection lost'},status:400},{error:{message:'unclassified'}}]) {
    const r=await ready({write:value}); const c=createV2SaveController(r.client,r.capability,draft());
    const state=await c.save(); assert.equal(state.phase,'partial_or_unknown');
    await c.save(); await c.refresh();
    assert.equal(c.getState().phase,'partial_or_unknown'); assert.ok(c.getState().observedSnapshot);
    assert.equal(writes(r.calls).length,1);
  }
});
test('invalid/old v1 success shape is unknown rather than a v2 success or failure',async()=>{
  const r=await ready({write:{data:{ok:true,match_id:matchId,watch_record_id:watchId}}});
  const result=await createV2SaveController(r.client,r.capability,draft()).save();
  assert.equal(result.phase,'partial_or_unknown'); assert.equal(result.receipt,undefined);
});
test('created client_key maps to DB UUID; one snapshot restores canonical all-ticket state',async()=>{
  const after=snapshot('6',later); after.tickets.push(ticketRow(ticketC));
  const r=await ready({write:{data:{...receipt(),created_tickets:[{client_key:'new',id:ticketC}]}},read:[{data:after}]});
  const input=draft(); input.tickets=[...input.tickets,createTicketDraft({status:'purchased'},'new')];
  const state=await createV2SaveController(r.client,r.capability,input).save();
  assert.equal(state.phase,'completed'); assert.equal(state.receipt!.created_tickets[0].id,ticketC);
  assert.equal(state.snapshot!.record.tickets.length,2);
  assert.deepEqual(state.snapshot!.record.ticketInfo,state.snapshot!.record.tickets[0]);
});
test('bad UUID mapping is unknown; same-revision snapshot missing created UUID is sync failure',async()=>{
  const input=draft(); input.tickets=[createTicketDraft({},'new')]; // omitted existing remains
  const a=await ready({write:{data:{...receipt(),created_tickets:[{client_key:'wrong',id:ticketC}]}}});
  assert.equal((await createV2SaveController(a.client,a.capability,input).save()).phase,'partial_or_unknown');
  const b=await ready({write:{data:{...receipt(),created_tickets:[{client_key:'new',id:ticketC}]}},read:[{data:snapshot('6',later)}]});
  assert.equal((await createV2SaveController(b.client,b.capability,input).save()).phase,'saved_sync_failed');
});
test('a pending unknown operation blocks a new controller for the same ID',async()=>{
  const r=await ready({write:new TypeError('offline')});
  const a=createV2SaveController(r.client,r.capability,draft()); await a.save();
  const b=createV2SaveController(r.client,r.capability,draft()); assert.equal((await b.save()).phase,'rejected');
  assert.equal(writes(r.calls).length,1);
});
test('in-flight double submit is one RPC, and callback exceptions cannot trigger a retry',async()=>{
  let release!:(value:Response)=>void;
  const r=await ready({writePromise:new Promise(resolve=>{release=resolve;})});
  const c=createV2SaveController(r.client,r.capability,draft(),()=>{throw new Error('view error');});
  const pending=c.save(); assert.equal((await c.save()).phase,'saving'); release({data:receipt()});
  assert.equal((await pending).phase,'completed'); assert.equal(writes(r.calls).length,1);
});
test('two normal sequential saves use the synchronized baseline and exact DB timestamp',async()=>{
  const r=await ready({read:[{data:snapshot('6',later)},{data:snapshot('7','2026-11-06T00:00:00.123458Z')}]});
  const first=await createV2SaveController(r.client,r.capability,draft()).save();
  const next:V2SaveDraft={contract:'atomic_v2',record:{...first.snapshot!.record,notes:'second'},baseline:first.snapshot!,tickets:first.snapshot!.record.tickets};
  // Mock a second server response without replacing the capability-bound client object.
  const original=r.client.rpc.bind(r.client);
  (r.client as any).rpc=async(name:string,args:any)=>{
    const result=await original(name,args);
    return name==='save_match_record'?{data:{...receipt(),revision:'7',updated_at:'2026-11-06T00:00:00.123458Z'}}:result;
  };
  const second=await createV2SaveController(r.client,r.capability,next).save();
  assert.equal(second.phase,'completed'); assert.equal(writes(r.calls).length,2);
  const match=writes(r.calls)[1].args.p_payload.match;
  assert.equal(match.expected_revision,'6'); assert.equal(match.expected_updated_at,later);
});

test('legacy REST known network/504 uncertainty never triggers compensation DELETE',async()=>{
  for (const failure of [new TypeError('fetch failed'),{error:{message:'gateway timeout'},status:504},{error:{message:'offline'},status:0}]) {
    let deletes=0;
    const client={from(table:string) { return {
      select:()=>({eq:()=>({data:[],error:null})}),
      upsert() {
        if (table==='matches') return {select:()=>({single:async()=>({data:{updated_at:stamp},error:null})})};
        if (failure instanceof Error) throw failure;
        return failure;
      },
      delete() { deletes++; throw new Error('compensation forbidden'); },
    }; }} as unknown as SupabaseClient;
    const record={...base().record,tickets:[],ticketInfo:{status:'release_waiting' as const}};
    delete (record as any).revision;
    await assert.rejects(saveMatchRecord(client,owner,record as any,true),error=>{
      assert.ok(error instanceof Error); assert.match(error.message,/保存結果を確認できません/); assert.ok(error.message.includes(matchId)); return true;
    });
    assert.equal(deletes,0);
  }
});
test('v2 malformed ticket input is rejected before RPC and capability cannot be forged',async()=>{
  const r=await ready(), input=draft(); input.tickets=[{clientKey:'x',quantity:0}];
  assert.throws(()=>createV2SaveController(r.client,r.capability,input)); assert.equal(writes(r.calls).length,0);
  assert.throws(()=>createV2SaveController(r.client,{contract:'atomic_v2'} as V2Capability,draft()));
});
test('new-ID unknown result retains the same ID/client key and read-only confirmation cannot declare success',async()=>{
  const r=await ready({write:{error:{message:'timeout'},status:504},read:[{error:{code:'42501',message:'not found'}}]});
  const record={...base().record,id:otherId};
  const input:V2SaveDraft={contract:'atomic_v2',record,baseline:null,tickets:[createTicketDraft({},'stable-new')]};
  const c=createV2SaveController(r.client,r.capability,input); const result=await c.save();
  assert.equal(result.phase,'partial_or_unknown'); assert.equal(result.request.matchId,otherId);
  await c.refresh(); await c.save();
  assert.equal(c.getState().phase,'partial_or_unknown'); assert.equal(writes(r.calls).length,1);
  assert.equal(writes(r.calls)[0].args.p_payload.match.id,otherId);
  assert.equal(writes(r.calls)[0].args.p_payload.ticket_changes.create[0].client_key,'stable-new');
});
test('late older reads and stale controllers cannot overwrite a newer confirmed generation',async()=>{
  const r=await ready({read:[{data:snapshot('8','2026-11-06T00:00:01Z')}]});
  const {fetchV2Snapshot}=await import('./src/lib/atomic/adapter');
  await fetchV2Snapshot(r.client,r.capability,matchId);
  const c=createV2SaveController(r.client,r.capability,draft());
  assert.equal((await c.save()).phase,'conflict'); assert.equal(writes(r.calls).length,0);
  await assert.rejects(fetchV2Snapshot(r.client,r.capability,matchId),/Stale/);
});
test('unsupported legacy pitcher/event detail rows cannot be destructively replaced',()=>{
  const raw:any=snapshot(); raw.pitchers=[{id:ticketB,match_id:matchId,side:null,role:'other',player_name:'keep',notes:'hidden'}];
  const b=parseMatchSnapshot(raw,{ownerId:owner,matchId});
  const input:V2SaveDraft={contract:'atomic_v2',record:b.record,baseline:b,tickets:b.record.tickets,changedDetails:['pitchers']};
  assert.throws(()=>prepareV2Save(input,owner),/losslessly/);
  input.changedDetails=[]; assert.equal('replace' in prepareV2Save(input,owner).payload,false);
});

test('snapshot without a watch builds required watch creation; explicit empty categories are allowed',()=>{
  const raw:any=snapshot(); raw.watch_record=null; raw.categories=[]; raw.seats=[];
  const b=parseMatchSnapshot(raw,{ownerId:owner,matchId});
  const request=prepareV2Save({contract:'atomic_v2',record:b.record,baseline:b,tickets:b.record.tickets,changedDetails:['categories']},owner);
  assert.equal((request.payload.watch as any).watch_status,'scheduled');
  assert.deepEqual(request.payload.categories,[]);
});
test('session owner changes reject before RPC and do not discard the input',async()=>{
  const r=await ready();
  (r.client as any).auth.getSession=async()=>({data:{session:{user:{id:otherId}}},error:null});
  const c=createV2SaveController(r.client,r.capability,draft());
  const result=await c.save(); assert.equal(result.phase,'rejected'); assert.equal(writes(r.calls).length,0);
  assert.equal(result.request.input.baseline!.revision,'5');
});

test('SDK retry is explicitly disabled on capability, save and snapshot requests',async()=>{
  const m=mock({read:[{data:snapshot()}]}), retries:boolean[]=[];
  const original=m.client.rpc.bind(m.client);
  (m.client as any).rpc=(name:string,args:any)=>{
    const operation=original(name,args);
    (operation as any).retry=(enabled:boolean)=>{retries.push(enabled);return operation;};
    return operation;
  };
  const {capability}=await verifyV2Capability(m.client,{contract:'atomic_v2',ownerId:owner,probeMatchId:matchId});
  assert.equal((await createV2SaveController(m.client,capability,draft()).save()).phase,'completed');
  assert.deepEqual(retries,[false,false,false]);
});
