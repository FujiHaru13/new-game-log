import type { MatchRecord } from '../../types/baseball';
import type { DetailCollection, V2SaveDraft } from './payload';
import type { MatchSnapshot } from './snapshot';
import type { TicketEditorDraft } from './ticketEditorDraft';
import { ticketEditorChanges } from './ticketEditorDraft';
import { same, timestampMicros, uuid } from './validation';
import { ticketFields } from './tickets';

/** Fields the existing form is able to render. An ordinary REST record is not a revision baseline. */
const visibleFields = [
  'date', 'time', 'isDateUnknown', 'homeTeamId', 'awayTeamId', 'stadiumId',
  'stadiumCustom', 'matchType', 'matchStatus', 'homeScore', 'awayScore',
  'isScoreConfirmed', 'matchDurationMinutes', 'watchStatus', 'cheerTeamId',
  'companions', 'watchMemo', 'events', 'notes',
] as const satisfies readonly (keyof MatchRecord)[];

const collections = [
  ['categories', ['categories', 'primaryCategory']],
  ['seat', ['seatInfo']],
  ['innings', ['innings']],
  ['pitchers', ['pitchers']],
  ['events', ['homeRuns']],
  ['links', ['links']],
  ['splits', ['splits']],
] as const;

function ticketShape(ticket: MatchRecord['tickets'][number]) {
  return Object.fromEntries(Object.keys(ticketFields).map(field => [field, ticket[field as keyof typeof ticket] ?? null]));
}

function editableCost(record: Pick<MatchRecord, 'costInfo'>) {
  const { splits: _splits, ...cost } = record.costInfo;
  return cost;
}

function failMismatch(label: string): never {
  throw new Error(`編集開始後に${label}の内容が変化したか、旧画面では完全に読み込めません。再取得・確認が必要です。`);
}

/**
 * Pure READ-ONLY preflight for a future full-form save. This does not authorize any RPC.
 * In particular, unrepresented child rows must never be replaced just because the
 * legacy form initialized their controls to empty values.
 */
export function planFullFormV2(
  original: MatchRecord,
  edited: MatchRecord,
  snapshot: MatchSnapshot,
  ticketDraft: TicketEditorDraft,
): V2SaveDraft {
  if (uuid(original.id) !== uuid(edited.id) || uuid(original.id) !== uuid(snapshot.record.id)) {
    throw new Error('編集対象の試合IDが一致しません。');
  }
  if (timestampMicros(original.updatedAt) !== timestampMicros(snapshot.updatedAt) ||
      timestampMicros(edited.updatedAt) !== timestampMicros(snapshot.updatedAt)) failMismatch('試合の更新時刻');
  if (snapshot.record.matchStatus === 'postponed') throw new Error('延期試合は現行フォームで安全に編集できません。');

  // Every form-backed value must be confirmed against the authoritative snapshot.
  // A REST projection omitting v2-only data is not evidence that the data is empty.
  for (const key of visibleFields) {
    if (!same(original[key], snapshot.record[key])) failMismatch(key);
  }
  if (!same(editableCost(original), editableCost(snapshot.record))) failMismatch('費用情報');
  for (const [, fields] of collections) {
    for (const field of fields) {
      const left = field === 'splits' ? original.costInfo.splits : original[field as keyof MatchRecord];
      const right = field === 'splits' ? snapshot.record.costInfo.splits : snapshot.record[field as keyof MatchRecord];
      if (!same(left, right)) failMismatch(field);
    }
  }
  if (original.tickets.length !== snapshot.record.tickets.length ||
      original.tickets.length !== ticketDraft.baseline.length) failMismatch('チケット件数');
  const byId = new Map(snapshot.record.tickets.map(ticket => [uuid(ticket.id), ticketShape(ticket)]));
  if (byId.size !== snapshot.record.tickets.length) failMismatch('チケットID');
  for (let i=0; i<original.tickets.length; i++) {
    const old=original.tickets[i], draftBase=ticketDraft.baseline[i];
    if (!old.id || !draftBase.id || uuid(old.id)!==uuid(draftBase.id) ||
        !same(ticketShape(old),ticketShape(draftBase)) ||
        !same(ticketShape(old),byId.get(uuid(old.id)))) failMismatch('チケットの編集基準');
  }
  ticketEditorChanges(ticketDraft); // validate create/update/delete before constructing an intent

  const changedDetails: DetailCollection[]=[];
  for (const [collection, fields] of collections) {
    let changed=false;
    for (const field of fields) {
      const a=field === 'splits' ? original.costInfo.splits : original[field as keyof MatchRecord];
      const b=field === 'splits' ? edited.costInfo.splits : edited[field as keyof MatchRecord];
      changed ||= !same(a,b);
    }
    if (!changed) continue;
    // The legacy editor does not retain all per-row IDs/metadata. Never silently
    // destroy those rows through the v2 replace semantics.
    if (collection === 'links' && snapshot.raw.links.length ||
        collection === 'splits' && snapshot.raw.splits.length) {
      throw new Error(`${collection}には旧画面から保持できない既存行があります。差分更新方式の実装まで置換を禁止します。`);
    }
    if (collection === 'pitchers' && snapshot.raw.pitchers.some(p => p.notes !== null || p.role === 'other') ||
        collection === 'events' && snapshot.raw.events.some(e => e.side !== null)) {
      throw new Error(`${collection}には旧画面に表現できない既存行があります。置換を禁止します。`);
    }
    changedDetails.push(collection);
  }

  return {
    contract:'atomic_v2',
    record:structuredClone(edited),
    baseline:snapshot,
    tickets:structuredClone(ticketDraft.rows),
    deletedTicketIds:[...ticketDraft.deletedIds],
    changedDetails,
  };
}
