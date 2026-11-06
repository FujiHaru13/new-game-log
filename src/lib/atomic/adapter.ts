import type { SupabaseClient } from '@supabase/supabase-js';
import { parseMatchSnapshot, assertSnapshotFloor, type MatchSnapshot, type SnapshotFloor } from './snapshot';
import { prepareV2Save, type PreparedV2Save, type V2SaveDraft } from './payload';
import { dbTimestamp, exactKeys, freezeCopy, object, revision, timestampMicros, uuid, type JsonObject } from './validation';

export type SavePhase='idle'|'saving'|'rejected'|'conflict'|'partial_or_unknown'|'saved_syncing'|'saved_sync_failed'|'completed';
export interface SaveIssue { message:string; code?:string; status?:number }
export interface V2Receipt { ok:true; match_id:string; watch_record_id:string; updated_at:string; revision:string; created_tickets:Array<{client_key:string;id:string}> }
export interface SaveState {
  phase:SavePhase; request:PreparedV2Save; issue?:SaveIssue; receipt?:V2Receipt; snapshot?:MatchSnapshot;
  observedSnapshot?:MatchSnapshot; // unknown-result read is evidence, never a success receipt
}
declare const verified:unique symbol;
export interface V2Capability { readonly contract:'atomic_v2'; readonly [verified]:true }
const capabilities=new WeakMap<object,{client:SupabaseClient;ownerId:string}>();
const watermarks=new WeakMap<SupabaseClient,Map<string,SnapshotFloor>>();
const outstanding=new WeakMap<SupabaseClient,Map<string,object>>();
function ownerFor(client:SupabaseClient,cap:V2Capability):string {
  const data=cap && capabilities.get(cap);
  if (!data || data.client!==client || cap.contract!=='atomic_v2') throw new Error('Verified v2 capability for this connection is required');
  return data.ownerId;
}
async function assertSessionOwner(client:SupabaseClient,ownerId:string) {
  const result=await client.auth.getSession();
  if (result.error || !result.data.session || uuid(result.data.session.user.id)!==ownerId) throw new Error('Authenticated session changed; obtain a new capability');
}
function key(ownerId:string,matchId:string) { return `${ownerId}:${matchId}`; }
function mapFor<T>(cache:WeakMap<SupabaseClient,Map<string,T>>,client:SupabaseClient) {
  let map=cache.get(client); if (!map) { map=new Map(); cache.set(client,map); } return map;
}
export class CapabilityError extends Error {
  constructor(public readonly kind:'unsupported'|'unavailable',message:string) { super(message); }
}
function issue(error:unknown,status?:number):SaveIssue {
  const source=error && typeof error==='object' ? error as Record<string,unknown> : {};
  return {message:typeof source.message==='string'?source.message:String(error),code:typeof source.code==='string'?source.code:undefined,status};
}
function rejection(error:unknown,status?:number):'conflict'|'rejected'|'partial_or_unknown' {
  const code=issue(error).code;
  if (status===0 || status===408 || status===504 || status && status>=500 || code?.startsWith('08')) return 'partial_or_unknown';
  if (code==='PT409') return 'conflict';
  if (code && (/^(22|23|25|28|40|42|P0)[A-Z0-9]{3}$/.test(code) || /^PGRST\d+$/.test(code) && status!==undefined && status>=400 && status<500)) return 'rejected';
  return 'partial_or_unknown';
}
function rpcOnce(client:SupabaseClient,name:string,args:JsonObject) {
  const operation=client.rpc(name,args);
  operation.retry?.(false); // also disable SDK retries; simple mock transports may be promises
  return operation;
}
async function readSnapshot(client:SupabaseClient,ownerId:string,matchId:string,floor?:SnapshotFloor):Promise<MatchSnapshot> {
  const id=uuid(matchId), map=mapFor(watermarks,client), known=map.get(key(ownerId,id));
  const result=await rpcOnce(client,'get_match_record_snapshot',{p_match_id:id});
  if (result.error) throw result.error;
  const snapshot=parseMatchSnapshot(result.data,{ownerId,matchId:id,floor});
  assertSnapshotFloor({revision:snapshot.revision,updatedAt:snapshot.updatedAt},known);
  map.set(key(ownerId,id),{revision:snapshot.revision,updatedAt:snapshot.updatedAt});
  return snapshot;
}
// Explicit opt-in + successful read-only contract validation. Errors never select v1/REST.
// A known owned probe record is required; an empty database needs a future capability endpoint.
export async function verifyV2Capability(client:SupabaseClient, options:{contract:'atomic_v2';ownerId:string;probeMatchId:string}):Promise<{capability:V2Capability;snapshot:MatchSnapshot}> {
  if (options.contract!=='atomic_v2') throw new CapabilityError('unsupported','Explicit v2 selection is required');
  const ownerId=uuid(options.ownerId);
  let snapshot:MatchSnapshot;
  try { await assertSessionOwner(client,ownerId); snapshot=await readSnapshot(client,ownerId,options.probeMatchId); await assertSessionOwner(client,ownerId); }
  catch (error) { throw new CapabilityError(issue(error).code==='PGRST202'?'unsupported':'unavailable',issue(error).message); }
  const capability=Object.freeze({contract:'atomic_v2'}) as V2Capability;
  capabilities.set(capability,{client,ownerId}); return {capability,snapshot};
}
export function fetchV2Snapshot(client:SupabaseClient,capability:V2Capability,matchId:string,floor?:SnapshotFloor) {
  return readSnapshot(client,ownerFor(client,capability),matchId,floor);
}
function receipt(value:unknown,request:PreparedV2Save):V2Receipt {
  const data=object(value,'v2 response'); exactKeys(data,['ok','match_id','watch_record_id','updated_at','revision','created_tickets']);
  if (data.ok!==true || uuid(data.match_id)!==request.matchId) throw new Error('Invalid v2 success response');
  uuid(data.watch_record_id); dbTimestamp(data.updated_at); revision(data.revision);
  const base=request.input.baseline;
  if (base && (BigInt(data.revision as string)<=BigInt(base.revision) || timestampMicros(data.updated_at)<=timestampMicros(base.updatedAt))) throw new Error('Invalid saved version');
  if (base?.raw.watch_record && uuid(data.watch_record_id)!==uuid(base.raw.watch_record.id)) throw new Error('Saved watch ID mismatch');
  if (!Array.isArray(data.created_tickets) || data.created_tickets.length!==request.ticketChanges.create.length) throw new Error('Invalid UUID mapping');
  const keys=new Set<string>(), ids=new Set((base?.record.tickets || []).map(ticket=>uuid(ticket.id)));
  const expected=new Set(request.ticketChanges.create.map(ticket=>ticket.client_key));
  for (const raw of data.created_tickets) {
    const item=object(raw); exactKeys(item,['client_key','id']);
    const id=uuid(item.id), clientKey=item.client_key;
    if (typeof clientKey!=='string' || !expected.has(clientKey) || keys.has(clientKey) || ids.has(id)) throw new Error('Invalid UUID mapping');
    keys.add(clientKey); ids.add(id);
  }
  return freezeCopy(data as unknown as V2Receipt);
}
export interface V2SaveController {
  getState():Readonly<SaveState>;
  save():Promise<Readonly<SaveState>>;
  refresh():Promise<Readonly<SaveState>>;
}
export function createV2SaveController(client:SupabaseClient,capability:V2Capability,draft:V2SaveDraft,onState?:(state:Readonly<SaveState>)=>void):V2SaveController {
  const ownerId=ownerFor(client,capability), request=prepareV2Save(draft,ownerId), operation={};
  const registry=mapFor(outstanding,client), token=key(ownerId,request.matchId);
  let state:SaveState={phase:'idle',request}, reading=false;
  const current=()=>freezeCopy(state);
  function set(patch:Partial<SaveState>) { state={...state,...patch}; try { onState?.(current()); } catch { /* view exceptions must not change DB outcome or trigger resend */ } }
  async function refresh():Promise<Readonly<SaveState>> {
    if (reading || !['saved_sync_failed','saved_syncing','partial_or_unknown'].includes(state.phase)) return current();
    reading=true;
    const unknown=state.phase==='partial_or_unknown';
    if (!unknown && state.phase!=='saved_syncing') set({phase:'saved_syncing',issue:undefined});
    try {
      const floor=state.receipt ? {revision:state.receipt.revision,updatedAt:state.receipt.updated_at} : request.input.baseline ? {revision:request.input.baseline.revision,updatedAt:request.input.baseline.updatedAt}:undefined;
      const snapshot=await fetchV2Snapshot(client,capability,request.matchId,floor);
      if (unknown) set({observedSnapshot:snapshot,issue:undefined});
      else {
        if (snapshot.revision===state.receipt!.revision && (snapshot.raw.watch_record?.id!==state.receipt!.watch_record_id || state.receipt!.created_tickets.some(item=>!snapshot.record.tickets.some(ticket=>uuid(ticket.id)===uuid(item.id))))) throw new Error('Snapshot does not match committed receipt');
        set({phase:'completed',snapshot,issue:undefined}); registry.delete(token);
      }
    } catch (error) { set({phase:unknown?'partial_or_unknown':'saved_sync_failed',issue:issue(error)}); }
    finally { reading=false; }
    return current();
  }
  return {
    getState:current,
    async save() {
      if (state.phase!=='idle') return current(); // one attempt per immutable intent
      if (registry.has(token)) { set({phase:'rejected',issue:{message:'Another save is pending confirmation for this match'}}); return current(); }
      const floor=mapFor(watermarks,client).get(token), baseline=request.input.baseline;
      try { if (baseline) assertSnapshotFloor({revision:baseline.revision,updatedAt:baseline.updatedAt},floor); }
      catch (error) { set({phase:'conflict',issue:issue(error)}); return current(); }
      registry.set(token,operation); set({phase:'saving'});
      try { await assertSessionOwner(client,ownerId); }
      catch (error) { set({phase:'rejected',issue:issue(error)}); registry.delete(token); return current(); }
      try {
        const result=await rpcOnce(client,'save_match_record',{p_payload:structuredClone(request.payload) as JsonObject});
        if (result.error) {
          const phase=rejection(result.error,result.status); set({phase,issue:issue(result.error,result.status)});
          if (phase!=='partial_or_unknown') registry.delete(token);
          return current();
        }
        let saved:V2Receipt;
        try { saved=receipt(result.data,request); }
        catch (error) { set({phase:'partial_or_unknown',issue:issue(error,result.status)}); return current(); }
        set({phase:'saved_syncing',receipt:saved});
      } catch (error) { set({phase:'partial_or_unknown',issue:issue(error)}); return current(); }
      return refresh();
    },
    refresh,
  };
}
