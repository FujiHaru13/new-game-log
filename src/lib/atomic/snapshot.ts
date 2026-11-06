import type { MatchRecord } from '../../types/baseball';
import { toMatchRecord } from '../supabaseRecords';
import { dbTimestamp, date, exactKeys, freezeCopy, object, revision, timestampMicros, uuid, type JsonObject } from './validation';
import { refundStatuses, ticketStatuses, type AtomicTicket } from './tickets';

type Check = (value: unknown) => boolean;
const text: Check = value => typeof value==='string';
const boolean: Check = value => typeof value==='boolean';
const number: Check = value => typeof value==='number' && Number.isFinite(value);
const integer: Check = value => number(value) && Number.isInteger(value) && Number(value)>=0 && Number(value)<=2147483647;
const positive: Check = value => integer(value) && Number(value)>0;
const money: Check = value => number(value) && Number(value)>=0 && Number(value)<=9999999999.99;
const id: Check = value => { uuid(value); return true; };
const day: Check = value => { date(value); return true; };
const time: Check = value => typeof value==='string' && /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?$/.test(value);
const stamp: Check = value => { dbTimestamp(value); return true; };
const rev: Check = value => { revision(value); return true; };
const oneOf = (...values: string[]): Check => value => typeof value==='string' && values.includes(value);
const nullable = (check: Check): Check => value => value===null || check(value);
const ns=nullable(text), ni=nullable(integer), nm=nullable(money), nd=nullable(day), nu=nullable(id);
const audit={created_at:stamp,updated_at:stamp};
const own={owner_id:id}, related={match_id:id}, watched={watch_record_id:id};
const side=oneOf('home','away');
const jsonValue:Check = value => value===null || typeof value==='string' || typeof value==='boolean' || number(value)
  || Array.isArray(value) && value.every(jsonValue)
  || !!value && typeof value==='object' && Object.values(value).every(jsonValue);
const schemas: Record<string,Record<string,Check>> = {
  match: {id,...own,legacy_id:ns,match_date:nd,date_unknown:boolean,start_time:nullable(time),home_team_id:text,away_team_id:text,
    stadium_id:ns,stadium_custom_name:ns,match_type:oneOf('official','interleague','open','climax','nippon_series','practice','international','other'),
    match_status:oneOf('scheduled','finished','cancelled','in_progress','postponed'),home_score:ni,away_score:ni,score_confirmed:boolean,duration_minutes:nullable(positive),events:ns,notes:ns,
    source_document:ns,source_row_number:nullable(positive),source_payload:jsonValue,...audit,revision:rev},
  watch_record:{id,...own,...related,watch_status:oneOf('watched','scheduled','cancelled'),cheer_team_id:text,companions:ns,watch_memo:ns,
    total_price:nm,my_expense:nm,payment_date:nd,payment_destination:ns,payment_method:ns,cost_memo:ns,refund_amount:nm,refund_status:oneOf(...refundStatuses),...audit},
  tickets:{id,...own,...related,status:oneOf(...ticketStatuses),release_date:nd,purchase_date:nd,issue_date:nd,payment_deadline:nd,
    quantity:nullable(positive),seat_type_name:ns,seat_area:ns,seat_row:ns,seat_number:ns,ticket_type:ns,vendor:ns,notes:ns,
    purchase_amount:nm,my_expense:nm,refund_amount:nm,refund_status:oneOf(...refundStatuses),...audit},
  categories:{...own,...watched,category_id:oneOf('dragons_1st','dragons_2nd','japan','other'),is_primary:boolean},
  seats:{...own,...watched,seat_type_id:ns,custom_seat_type_name:ns,area:ns,seat_row:ns,seat_number:ns},
  splits:{id,...own,...watched,title:text,amount:money,paid_date:nd,memo:ns,...audit},
  payments:{id,...own,...related,watch_record_id:nu,ticket_id:nu,title:text,amount:money,paid_date:nd,payment_destination:ns,payment_method:ns,memo:ns,refund_amount:nm,...audit},
  innings:{...related,inning_number:positive,side,runs:ni,is_not_played:boolean},
  totals:{...related,side,hits:ni,errors:ni},
  pitchers:{id,...related,side:nullable(side),role:oneOf('starter','winning','losing','save','other'),player_name:text,notes:ns},
  events:{id,...related,event_type:oneOf('home_run','other'),side:nullable(side),player_name:ns,description:text,event_order:nullable(positive)},
  links:{id,...related,title:text,url:value => text(value) && /^https?:\/\//i.test(String(value))},
};
export type AtomicRecord = Omit<MatchRecord,'matchStatus'|'tickets'|'ticketInfo'> & {
  matchStatus: MatchRecord['matchStatus']|'postponed'; tickets: AtomicTicket[]; ticketInfo: AtomicTicket; revision: string;
};
export type SnapshotRaw = { match: JsonObject; watch_record: JsonObject|null; updated_at: string; revision: string } &
  Record<'tickets'|'categories'|'seats'|'splits'|'payments'|'innings'|'totals'|'pitchers'|'events'|'links',JsonObject[]>;
export interface MatchSnapshot { record: AtomicRecord; raw: SnapshotRaw; ownerId: string; revision: string; updatedAt: string }
export interface SnapshotFloor { revision: string; updatedAt?: string }
function row(value: unknown, schema: string): JsonObject {
  const result={...object(value,schema)}, checks=schemas[schema]; exactKeys(result,Object.keys(checks));
  for (const [key,check] of Object.entries(checks)) if (!check(result[key])) throw new Error(`Invalid ${schema}.${key}`);
  for (const key of ['id','owner_id','match_id','watch_record_id','ticket_id']) if (result[key]!==undefined && result[key]!==null) result[key]=uuid(result[key]);
  return result;
}
export function validateDbFields(schema:string, fields:JsonObject) {
  for (const [key,value] of Object.entries(fields)) {
    const checked=key==='start_time' && typeof value==='string' && /^\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;
    if (!schemas[schema]?.[key] || !schemas[schema][key](checked)) throw new Error(`Invalid ${schema}.${key}`);
  }
}
export function assertSnapshotFloor(value: SnapshotFloor, floor?: SnapshotFloor) {
  const actual=BigInt(revision(value.revision));
  if (!floor) return;
  const minimum=BigInt(revision(floor.revision));
  if (actual<minimum) throw new Error('Stale snapshot revision');
  if (floor.updatedAt && value.updatedAt) {
    const dt=timestampMicros(value.updatedAt), min=timestampMicros(floor.updatedAt);
    if (dt<min || (actual===minimum && dt!==min)) throw new Error('Snapshot revision/time mismatch');
  }
}
export function parseMatchSnapshot(value: unknown, expected: { ownerId: string; matchId: string; floor?: SnapshotFloor }): MatchSnapshot {
  const data=object(value,'snapshot');
  const lists=['tickets','categories','seats','splits','payments','innings','totals','pitchers','events','links'] as const;
  exactKeys(data,['match','watch_record','updated_at','revision',...lists]);
  const m=row(data.match,'match'), w=data.watch_record===null ? null : row(data.watch_record,'watch_record');
  const ownerId=uuid(expected.ownerId), matchId=uuid(expected.matchId), updatedAt=dbTimestamp(data.updated_at), version=revision(data.revision);
  if (uuid(m.id)!==matchId || uuid(m.owner_id)!==ownerId || m.revision!==version || timestampMicros(m.updated_at)!==timestampMicros(updatedAt)) throw new Error('Snapshot parent identity/version mismatch');
  if (w && (uuid(w.match_id)!==matchId || uuid(w.owner_id)!==ownerId)) throw new Error('Snapshot watch mismatch');
  const parsed: Record<string,JsonObject[]>={};
  for (const name of lists) {
    if (!Array.isArray(data[name])) throw new Error(`Missing snapshot ${name}`);
    const rows=(data[name] as unknown[]).map(value => row(value,name));
    const keys=new Set<string>();
    for (const item of rows) {
      if ('match_id' in item && uuid(item.match_id)!==matchId) throw new Error('Cross-match snapshot row');
      if ('owner_id' in item && uuid(item.owner_id)!==ownerId) throw new Error('Cross-owner snapshot row');
      if (['categories','seats','splits'].includes(name) && (!w || uuid(item.watch_record_id)!==uuid(w.id))) throw new Error('Cross-watch snapshot row');
      const key=String(item.id ?? (name==='innings' ? `${item.inning_number}:${item.side}` : name==='totals' ? item.side : name==='categories' ? item.category_id : item.watch_record_id)).toLowerCase();
      if (keys.has(key)) throw new Error('Duplicate snapshot row'); keys.add(key);
    }
    parsed[name]=rows;
  }
  if (parsed.seats.length>1 || parsed.categories.filter(item=>item.is_primary).length>1) throw new Error('Invalid snapshot cardinality');
  const ticketIds=new Set(parsed.tickets.map(item=>uuid(item.id)));
  for (const p of parsed.payments) {
    if (p.watch_record_id===null && p.ticket_id===null) throw new Error('Payment target missing');
    if (p.watch_record_id!==null && (!w || uuid(p.watch_record_id)!==uuid(w.id))) throw new Error('Payment watch mismatch');
    if (p.ticket_id!==null && !ticketIds.has(uuid(p.ticket_id))) throw new Error('Payment ticket mismatch');
  }
  if ((m.date_unknown && m.match_date!==null) || (!m.date_unknown && m.match_date===null)
      || m.home_team_id===m.away_team_id || (m.score_confirmed && (m.home_score===null || m.away_score===null))) throw new Error('Invalid match invariants');
  assertSnapshotFloor({revision:version,updatedAt},expected.floor);
  type Args=Parameters<typeof toMatchRecord>;
  // Validated DB rows go through the existing mapper; raw retains fields the legacy UI cannot edit.
  const legacy=toMatchRecord(m as unknown as Args[0],w as unknown as Args[1],parsed.categories as unknown as Args[2],parsed.seats[0] as unknown as Args[3],parsed.tickets as unknown as Args[4],{
    innings:parsed.innings,totals:parsed.totals,pitchers:parsed.pitchers,events:parsed.events,links:parsed.links,splits:parsed.splits,
  } as unknown as Args[5]);
  const tickets: AtomicTicket[]=legacy.tickets.map(ticket=>{
    const source=parsed.tickets.find(item=>uuid(item.id)===uuid(ticket.id))!;
    return {...ticket,purchaseAmount:source.purchase_amount===null?undefined:source.purchase_amount as number,
      myExpense:source.my_expense===null?undefined:source.my_expense as number,refundAmount:source.refund_amount===null?undefined:source.refund_amount as number,
      refundStatus:source.refund_status as AtomicTicket['refundStatus']};
  });
  // Preserve absent inning positions, and totals even when no inning row exists.
  if (parsed.innings.length || parsed.totals.length) {
    const count=Math.max(0,...parsed.innings.map(item=>Number(item.inning_number)));
    if (count>10000) throw new Error('Unsupported inning count');
    const home: (number|'X'|null)[]=Array(count).fill(null), away: (number|null)[]=Array(count).fill(null);
    for (const item of parsed.innings) {
      const index=Number(item.inning_number)-1;
      if (item.side==='home') home[index]=item.is_not_played?'X':item.runs as number|null;
      else away[index]=item.runs as number|null;
    }
    const h=parsed.totals.find(item=>item.side==='home'), a=parsed.totals.find(item=>item.side==='away');
    legacy.innings={home,away,homeHits:h?.hits as number|null,awayHits:a?.hits as number|null,homeErrors:h?.errors as number|null,awayErrors:a?.errors as number|null};
  }
  const record: AtomicRecord={...legacy,updatedAt,matchStatus:m.match_status as AtomicRecord['matchStatus'],tickets,ticketInfo:tickets[0]?{...tickets[0]}:{status:'release_waiting'},revision:version};
  return freezeCopy({record,raw:{...data,match:m,watch_record:w,...parsed} as SnapshotRaw,ownerId,revision:version,updatedAt});
}

// Future UI/store integration must use this before replacing an already-held snapshot.
export function acceptSnapshot(current:MatchSnapshot|undefined, incoming:MatchSnapshot):MatchSnapshot {
  const next=parseMatchSnapshot(incoming.raw,{ownerId:incoming.ownerId,matchId:incoming.record.id,
    floor:current?{revision:current.revision,updatedAt:current.updatedAt}:undefined});
  if (current && (current.ownerId!==next.ownerId || current.record.id!==next.record.id)) throw new Error('Snapshot target mismatch');
  return next;
}
