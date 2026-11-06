import type { MatchRecord } from '../../types/baseball';
import { matchPayload, watchPayload } from '../supabaseRecords';
import { buildTicketChanges, type TicketChanges, type TicketEdit } from './tickets';
import { parseMatchSnapshot, validateDbFields, type MatchSnapshot, type AtomicRecord } from './snapshot';
import { dbTimestamp, freezeCopy, object, revision, same, uuid, type JsonObject } from './validation';

export type DetailCollection='categories'|'seat'|'innings'|'pitchers'|'events'|'links'|'splits';
export interface V2SaveDraft {
  contract: 'atomic_v2';
  record: MatchRecord|AtomicRecord;
  baseline: MatchSnapshot|null;
  tickets: readonly TicketEdit[];
  deletedTicketIds?: readonly string[];
  changedDetails?: readonly DetailCollection[];
}
export interface PreparedV2Save {
  contract:'atomic_v2'; ownerId:string; matchId:string; input:V2SaveDraft; ticketChanges:TicketChanges; payload:JsonObject;
}
export function createNewMatchDraft(input: Omit<MatchRecord,'id'>, id: string = crypto.randomUUID()): MatchRecord {
  const copy=structuredClone(input) as Omit<MatchRecord,'id'> & {revision?:unknown};
  delete copy.revision;
  return {...copy,id:uuid(id)}; // allocate once when editing starts, never during save/refresh
}
function core(record:MatchRecord|AtomicRecord, ownerId:string) {
  const {owner_id: _matchOwner,...match}=matchPayload(record as MatchRecord,ownerId);
  const {owner_id: _watchOwner,...watch}=watchPayload(record as MatchRecord,ownerId);
  return {match,watch};
}
function changed(current:JsonObject, baseline:JsonObject) {
  return Object.fromEntries(Object.entries(current).filter(([key,value])=>!same(value,baseline[key])));
}
export function prepareV2Save(input:V2SaveDraft, expectedOwnerId:string): PreparedV2Save {
  if (input.contract!=='atomic_v2') throw new Error('Explicit v2 contract is required');
  const ownerId=uuid(expectedOwnerId), matchId=uuid(input.record.id), record=input.record;
  for (const key of ['date','time','homeTeamId','awayTeamId','stadiumId','stadiumCustom','events','notes','cheerTeamId','companions','watchMemo'] as const) {
    if (record[key]!==undefined && record[key]!==null && typeof record[key]!=='string') throw new Error(`Invalid draft ${key}`);
  }
  const baseline=input.baseline ? parseMatchSnapshot(input.baseline.raw,{ownerId,matchId}) : null;
  if (baseline && (baseline.revision!==input.baseline!.revision || baseline.updatedAt!==input.baseline!.updatedAt)) throw new Error('Baseline metadata mismatch');
  const draft=core(record,ownerId), base=baseline ? core(baseline.record,ownerId) : null;
  validateDbFields('match',draft.match); validateDbFields('watch_record',draft.watch);
  if (!record.homeTeamId || !record.awayTeamId || record.homeTeamId===record.awayTeamId) throw new Error('Invalid match teams');
  if (!record.isDateUnknown && !draft.match.match_date || record.isScoreConfirmed && (record.homeScore===null || record.awayScore===null)) throw new Error('Invalid match invariants');
  if (baseline && dbTimestamp(record.updatedAt)!==baseline.updatedAt) throw new Error('Draft must retain baseline DB timestamp');
  const tickets=buildTicketChanges(baseline?.record.tickets || [],input.tickets,input.deletedTicketIds);
  const match:JsonObject={...(base?changed(draft.match,base.match):draft.match),id:matchId,expected_revision:baseline?revision(baseline.revision):'0'};
  if (baseline) match.expected_updated_at=baseline.updatedAt;
  const payload:JsonObject={contract_version:2,match,ticket_changes:tickets};
  const watch=base && baseline?.raw.watch_record ? changed(draft.watch,base.watch) : draft.watch;
  if (Object.keys(watch).length) payload.watch=watch;
  const replace:JsonObject={};
  const seen=new Set<string>();
  for (const name of input.changedDetails || []) {
    if (seen.has(name)) throw new Error('Duplicate detail replacement'); seen.add(name);
    replace[name]=true;
    switch (name) {
      case 'categories':
        if (!Array.isArray(record.categories) || new Set(record.categories).size!==record.categories.length || record.categories.length>0 && !record.categories.includes(record.primaryCategory)) throw new Error('Invalid categories');
        record.categories.forEach(id=>validateDbFields('categories',{category_id:id}));
        payload.categories=record.categories.map(id=>({id,is_primary:id===record.primaryCategory})); break;
      case 'seat':
        payload.seat={seat_type_id:record.seatInfo.seatTypeId || null,custom_seat_type_name:record.seatInfo.seatTypeName || null,
          area:record.seatInfo.area || null,seat_row:record.seatInfo.row || null,seat_number:record.seatInfo.seatNumber || null};
        validateDbFields('seats',payload.seat as JsonObject); break;
      case 'innings':
        // 0009 requires an object; empty object is the explicit clear operation.
        payload.innings=record.innings ? structuredClone(record.innings) : {};
        if (record.innings) {
          for (const side of ['home','away'] as const) {
            if (!Array.isArray(record.innings[side]) || record.innings[side].length>10000) throw new Error('Invalid innings');
            record.innings[side].forEach(value=>{ if (side==='home' && value==='X') return; validateDbFields('innings',{runs:value}); });
          }
          for (const key of ['homeHits','awayHits','homeErrors','awayErrors'] as const) if (record.innings[key]!==undefined) validateDbFields('totals',{hits:record.innings[key]});
        }
        break;
      case 'pitchers':
        if (baseline?.raw.pitchers.some(p=>p.notes!==null || p.role==='other' || (p.role==='starter' ? p.side===null : p.side!==null))
            || baseline && new Set(baseline.raw.pitchers.map(p=>`${p.side}:${p.role}`)).size!==baseline.raw.pitchers.length) throw new Error('Pitcher data cannot be losslessly replaced by this editor');
        payload.pitchers=record.pitchers ? structuredClone(record.pitchers) : {};
        for (const [key,value] of Object.entries(payload.pitchers as object)) if (!['homeStarter','awayStarter','winningPitcher','losingPitcher','savePitcher'].includes(key) || value!==undefined && typeof value!=='string') throw new Error('Invalid pitcher');
        break;
      case 'events':
        if (baseline && (baseline.raw.events.filter(e=>e.event_type==='other').length>1
            || baseline.raw.events.some(e=>e.side!==null || (e.event_type==='home_run' && e.player_name!==e.description)))) throw new Error('Event data cannot be losslessly replaced by this editor');
        if (record.homeRuns!==undefined && (!Array.isArray(record.homeRuns) || record.homeRuns.some(name=>typeof name!=='string'))) throw new Error('Invalid home runs');
        payload.home_runs=record.homeRuns || []; payload.events=record.events || null; break;
      case 'links':
        payload.links=record.links || [];
        if (!Array.isArray(payload.links)) throw new Error('Invalid links');
        (payload.links as unknown[]).forEach(item=>validateDbFields('links',object(item))); break;
      case 'splits':
        payload.splits=record.costInfo.splits.map(item=>({title:item.title,amount:item.amount,paid_date:item.paidDate || null,memo:item.memo || null}));
        (payload.splits as JsonObject[]).forEach(item=>validateDbFields('splits',item)); break;
      default: throw new Error('Unknown detail replacement');
    }
  }
  if (seen.size) payload.replace=replace;
  // The submitted intent must survive transport errors unchanged. No ticketInfo is consulted.
  object(payload.match); return freezeCopy({contract:'atomic_v2',ownerId,matchId,input:{...input,baseline},ticketChanges:tickets,payload});
}
