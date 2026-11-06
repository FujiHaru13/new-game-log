import { MatchRecord, CategoryId, MatchStatus, MatchType, WatchStatus, TicketStatus } from '../types/baseball';
import { SupabaseClient } from '@supabase/supabase-js';

type JsonRecord = Record<string, unknown>;

interface MatchRow extends JsonRecord {
  id: string;
  owner_id: string;
  match_date: string | null;
  date_unknown: boolean;
  start_time: string | null;
  home_team_id: string;
  away_team_id: string;
  stadium_id: string | null;
  stadium_custom_name: string | null;
  match_type: MatchType;
  match_status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  score_confirmed: boolean;
  duration_minutes: number | null;
  events: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface WatchRow extends JsonRecord {
  id: string;
  match_id: string;
  owner_id: string;
  watch_status: WatchStatus;
  cheer_team_id: string;
  companions: string | null;
  watch_memo: string | null;
  total_price: number | null;
  my_expense: number | null;
  payment_date: string | null;
  payment_destination: string | null;
  payment_method: string | null;
  cost_memo: string | null;
  refund_amount: number | null;
  refund_status: 'none' | 'pending' | 'completed';
  created_at: string;
  updated_at: string;
}

interface CategoryRow extends JsonRecord {
  owner_id: string;
  watch_record_id: string;
  category_id: CategoryId;
  is_primary: boolean;
}

interface SeatRow extends JsonRecord {
  owner_id: string;
  watch_record_id: string;
  seat_type_id: string | null;
  custom_seat_type_name: string | null;
  area: string | null;
  seat_row: string | null;
  seat_number: string | null;
}

interface TicketRow extends JsonRecord {
  id: string;
  match_id: string;
  owner_id: string;
  status: TicketStatus;
  release_date: string | null;
  purchase_date: string | null;
  issue_date: string | null;
  ticket_type: string | null;
  notes: string | null;
}

const asNullable = (value: string | undefined) => value || null;
const asDate = (value: string | null) => value || '';

export interface RecordTables {
  matches: MatchRow[];
  watches: WatchRow[];
  categories: CategoryRow[];
  seats: SeatRow[];
  tickets: TicketRow[];
}

export const loadRecordTables = async (client: SupabaseClient): Promise<RecordTables> => {
  const [matches, watches, categories, seats, tickets] = await Promise.all([
    client.from('matches').select('*').order('match_date', { ascending: false }),
    client.from('watch_records').select('*'),
    client.from('watch_record_categories').select('*'),
    client.from('seats').select('*'),
    client.from('tickets').select('*'),
  ]);
  for (const result of [matches, watches, categories, seats, tickets]) {
    if (result.error) throw new Error(`試合データの読み込みに失敗しました: ${result.error.message}`);
  }
  return {
    matches: (matches.data || []) as MatchRow[],
    watches: (watches.data || []) as WatchRow[],
    categories: (categories.data || []) as CategoryRow[],
    seats: (seats.data || []) as SeatRow[],
    tickets: (tickets.data || []) as TicketRow[],
  };
};

export const toMatchRecord = (
  match: MatchRow,
  watch: WatchRow | undefined,
  categories: CategoryRow[],
  seat: SeatRow | undefined,
  ticket: TicketRow | undefined,
): MatchRecord => {
  const recordCategories = categories.filter(row => row.watch_record_id === watch?.id);
  const primary = recordCategories.find(row => row.is_primary)?.category_id || recordCategories[0]?.category_id || 'other';
  return {
    id: match.id,
    date: asDate(match.match_date),
    time: match.start_time?.slice(0, 5),
    isDateUnknown: match.date_unknown,
    homeTeamId: match.home_team_id,
    awayTeamId: match.away_team_id,
    stadiumId: match.stadium_id || '',
    stadiumCustom: match.stadium_custom_name || undefined,
    matchType: match.match_type,
    matchStatus: match.match_status,
    homeScore: match.home_score,
    awayScore: match.away_score,
    isScoreConfirmed: match.score_confirmed,
    matchDurationMinutes: match.duration_minutes,
    events: match.events || undefined,
    notes: match.notes || undefined,
    watchStatus: watch?.watch_status || 'scheduled',
    cheerTeamId: watch?.cheer_team_id || 'dragons',
    categories: recordCategories.map(row => row.category_id),
    primaryCategory: primary,
    seatInfo: {
      seatTypeId: seat?.seat_type_id || undefined,
      seatTypeName: seat?.custom_seat_type_name || undefined,
      area: seat?.area || undefined,
      row: seat?.seat_row || undefined,
      seatNumber: seat?.seat_number || undefined,
    },
    companions: watch?.companions || undefined,
    watchMemo: watch?.watch_memo || undefined,
    costInfo: {
      totalPrice: watch?.total_price,
      myExpense: watch?.my_expense,
      paymentDate: watch?.payment_date || undefined,
      paymentDestination: watch?.payment_destination || undefined,
      paymentMethod: watch?.payment_method || undefined,
      memo: watch?.cost_memo || undefined,
      splits: [],
      refundAmount: watch?.refund_amount,
      refundStatus: watch?.refund_status || 'none',
    },
    ticketInfo: {
      status: ticket?.status || 'release_waiting',
      releaseDate: ticket?.release_date || undefined,
      purchaseDate: ticket?.purchase_date || undefined,
      issueDate: ticket?.issue_date || undefined,
      ticketType: ticket?.ticket_type || undefined,
      notes: ticket?.notes || undefined,
    },
    createdAt: match.created_at,
    updatedAt: match.updated_at,
  };
};

const matchPayload = (record: MatchRecord, ownerId: string) => ({
  id: record.id,
  owner_id: ownerId,
  match_date: record.isDateUnknown ? null : asNullable(record.date),
  date_unknown: record.isDateUnknown,
  start_time: asNullable(record.time),
  home_team_id: record.homeTeamId,
  away_team_id: record.awayTeamId,
  stadium_id: asNullable(record.stadiumId),
  stadium_custom_name: asNullable(record.stadiumCustom),
  match_type: record.matchType,
  match_status: record.matchStatus,
  home_score: record.homeScore,
  away_score: record.awayScore,
  score_confirmed: record.isScoreConfirmed,
  duration_minutes: record.matchDurationMinutes ?? null,
  events: record.events || null,
  notes: record.notes || null,
});

const watchPayload = (record: MatchRecord, ownerId: string) => ({
  match_id: record.id,
  owner_id: ownerId,
  watch_status: record.watchStatus,
  cheer_team_id: record.cheerTeamId,
  companions: record.companions || null,
  watch_memo: record.watchMemo || null,
  total_price: record.costInfo.totalPrice ?? null,
  my_expense: record.costInfo.myExpense ?? null,
  payment_date: record.costInfo.paymentDate || null,
  payment_destination: record.costInfo.paymentDestination || null,
  payment_method: record.costInfo.paymentMethod || null,
  cost_memo: record.costInfo.memo || null,
  refund_amount: record.costInfo.refundAmount ?? null,
  refund_status: record.costInfo.refundStatus || 'none',
});

const ticketPayload = (record: MatchRecord, ownerId: string) => ({
  match_id: record.id,
  owner_id: ownerId,
  status: record.ticketInfo.status,
  release_date: record.ticketInfo.releaseDate || null,
  purchase_date: record.ticketInfo.purchaseDate || null,
  issue_date: record.ticketInfo.issueDate || null,
  ticket_type: record.ticketInfo.ticketType || null,
  notes: record.ticketInfo.notes || null,
});

const validateSeatType = async (client: SupabaseClient, record: MatchRecord) => {
  const seatTypeId = record.seatInfo.seatTypeId?.trim();
  if (!seatTypeId) return;

  const result = await client.from('seat_types').select('id').eq('id', seatTypeId).maybeSingle();
  if (result.error) {
    throw new Error(`座席種別マスターの確認に失敗しました: ${result.error.message}`);
  }
  if (!result.data) {
    throw new Error(`座席種別「${seatTypeId}」はSupabaseのseat_typesに存在しません。マスター登録後に選択するか、自由入力を使用してください。`);
  }
};

export const saveMatchRecord = async (
  client: SupabaseClient,
  ownerId: string,
  record: MatchRecord,
  isNew: boolean,
) => {
  await validateSeatType(client, record);
  let matchWritten = false;

  try {
    const matchResult = await client.from('matches').upsert(matchPayload(record, ownerId)).select().single();
    if (matchResult.error) throw new Error(`試合情報の保存に失敗しました: ${matchResult.error.message}`);
    matchWritten = true;

    const watchResult = await client.from('watch_records').upsert(watchPayload(record, ownerId), { onConflict: 'match_id' });
    if (watchResult.error) throw new Error(`観戦情報の保存に失敗しました: ${watchResult.error.message}`);

    const watch = await client.from('watch_records').select('id').eq('match_id', record.id).single();
    if (watch.error || !watch.data) throw new Error('観戦記録のID取得に失敗しました。保存状態を確認してください。');
    const categoryDelete = await client.from('watch_record_categories').delete().eq('watch_record_id', watch.data.id);
    if (categoryDelete.error) throw new Error(`カテゴリ更新に失敗しました。部分保存の可能性があります: ${categoryDelete.error.message}`);
    const categoryRows = record.categories.map(category_id => ({
      owner_id: ownerId,
      watch_record_id: watch.data.id,
      category_id,
      is_primary: category_id === record.primaryCategory,
    }));
    if (categoryRows.length) {
      const categoryInsert = await client.from('watch_record_categories').insert(categoryRows);
      if (categoryInsert.error) throw new Error(`カテゴリ保存に失敗しました。部分保存の可能性があります: ${categoryInsert.error.message}`);
    }

    const seatDelete = await client.from('seats').delete().eq('watch_record_id', watch.data.id);
    if (seatDelete.error) throw new Error(`座席情報の更新に失敗しました。部分保存の可能性があります: ${seatDelete.error.message}`);
    const seat = record.seatInfo;
    if (seat.seatTypeId || seat.seatTypeName || seat.area || seat.row || seat.seatNumber) {
      const seatInsert = await client.from('seats').insert({
        owner_id: ownerId,
        watch_record_id: watch.data.id,
        seat_type_id: seat.seatTypeId?.trim() || null,
        custom_seat_type_name: seat.seatTypeName?.trim() || null,
        area: seat.area || null,
        seat_row: seat.row || null,
        seat_number: seat.seatNumber || null,
      });
      if (seatInsert.error) throw new Error(`座席保存に失敗しました。部分保存の可能性があります: ${seatInsert.error.message}`);
    }

    const ticketResult = await client.from('tickets').select('id').eq('match_id', record.id).maybeSingle();
    if (ticketResult.error) throw new Error(`チケット情報の確認に失敗しました: ${ticketResult.error.message}`);
    const ticketWrite = ticketResult.data
      ? await client.from('tickets').update(ticketPayload(record, ownerId)).eq('id', ticketResult.data.id)
      : await client.from('tickets').insert(ticketPayload(record, ownerId));
    if (ticketWrite.error) throw new Error(`チケット保存に失敗しました。部分保存の可能性があります: ${ticketWrite.error.message}`);
  } catch (error) {
    if (isNew && matchWritten) {
      const cleanup = await client.from('matches').delete().eq('id', record.id).eq('owner_id', ownerId);
      if (cleanup.error) {
        throw new Error(`${error instanceof Error ? error.message : '保存に失敗しました。'} 新規試合の自動ロールバックにも失敗しました（match_id: ${record.id}）。このIDを確認して手動回復してください。`);
      }
    }
    throw error;
  }
};

export const deleteMatchRecord = async (client: SupabaseClient, ownerId: string, id: string) => {
  const result = await client.from('matches').delete().eq('id', id).eq('owner_id', ownerId);
  if (result.error) throw new Error(`試合の削除に失敗しました: ${result.error.message}`);
};
